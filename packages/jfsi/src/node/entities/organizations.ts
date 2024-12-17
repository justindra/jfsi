import { Entity, EntityConfiguration, Schema } from 'electrodb';
import { ValidationException } from '../errors/index.js';
import { AUDIT_FIELDS, DDB_KEYS } from './defaults.js';
import { generateUserEntityDetails } from './users.js';
import { generateId } from './utils.js';

type GenerateOrganizationEntityDetailsParams<
  S extends Schema<string, string, string>,
  Roles extends string
> = {
  version?: string;
  service: string;
  organizationConfig?: S;
  availableRoles?: Roles[];
};

/**
 * Generate the ElectroDB configuration for an organization entity. This is
 * linked to JFSI's user entity as an organization requires users to be created
 * first. This will eventually allow a basic form of RBAC to be implemented on
 * top of the system.
 *
 * This configuration creates 2 different entities:
 *  - Organization - The organization itself
 *  - OrganizationUser - The organization and user combination, this is used to
 *                       ensure a user can only belong to an organization once.
 *                       Users are allowed to belong to multiple organizations,
 *                       but an organization can only have a user once.
 *
 * Please ensure the dynamodb table has the following indexes set as a minimum:
 * ```
 *  primaryIndex: {
 *      partitionKey: DDB_KEYS.defaultIndex.partitionKey,
 *      sortKey: DDB_KEYS.defaultIndex.sortKey
 *  },
 *  globalIndexes: {
 *      gsi1: { partitionKey: DDB_KEYS.gsi1.partitionKey, DDB_KEYS.gsi1.sortKey },
 *  },
 * ```
 * @param configuration The DynamoDB configuration as required by ElectroDB.
 * @param param.version The version to pass in as per ElectroDB
 * @param param.service The name of the service to pass in as per ElectroDB
 * @param param.organizationConfig Any extra configuration to override or add
 *                                 to the defaults
 * @param Users Organizations require users to be created first, so we need to
 *             pass in the user entity details so we can create the connection
 * @returns
 */
export const generateOrganizationEntityDetails = <
  A extends string,
  F extends string,
  C extends string,
  S extends Schema<A, F, C>,
  Roles extends string = 'owner' | 'admin' | 'member'
>(
  configuration: EntityConfiguration,
  {
    version = '1',
    service,
    organizationConfig,
    availableRoles = ['owner', 'admin', 'member'] as Roles[],
  }: GenerateOrganizationEntityDetailsParams<S, Roles>,
  Users: ReturnType<typeof generateUserEntityDetails>
) => {
  /**
   * The organization entity is used to represent an organization. An organization
   * ultimately owns all the other entities and provides access to each user that
   * has been added to that organization.
   */
  const OrganizationEntity = new Entity(
    {
      model: {
        version,
        service,
        entity: 'org',
      },
      attributes: {
        ...AUDIT_FIELDS,
        organizationId: {
          type: 'string',
          required: true,
          readOnly: true,
        },
        /** The name of the organization */
        name: { type: 'string' },
        ...((organizationConfig?.attributes || {}) as S['attributes']),
      },
      indexes: {
        organizationById: {
          pk: { field: 'pk', composite: ['organizationId'] },
          sk: { field: 'sk', composite: [] },
        },
        ...((organizationConfig?.indexes || {}) as S['indexes']),
      },
    },
    configuration
  );

  /**
   * The organization user entity is used to represent a user that is a member of
   * an organization and the role that they have in that organization.
   *
   * A user can belong to multiple organizations and an organization can have
   * multiple users.
   */
  const OrganizationUserEntity = new Entity(
    {
      model: {
        version,
        service,
        entity: 'org-user',
      },
      attributes: {
        ...AUDIT_FIELDS,
        organizationId: {
          type: 'string',
          required: true,
        },
        userId: {
          type: 'string',
          required: true,
          readOnly: true,
        },
        /** The role of the user in that organization */
        role: {
          type: availableRoles as Roles[],
          required: true,
        },
      },
      indexes: {
        usersInOrganization: {
          pk: {
            field: DDB_KEYS.defaultIndex.partitionKey,
            composite: ['organizationId'],
          },
          sk: { field: DDB_KEYS.defaultIndex.sortKey, composite: ['userId'] },
        },
        organizationForUsers: {
          index: DDB_KEYS.gsi1.indexName,
          pk: { field: DDB_KEYS.gsi1.partitionKey, composite: ['userId'] },
          sk: { field: DDB_KEYS.gsi1.sortKey, composite: ['organizationId'] },
        },
        allOrganizations: {
          index: DDB_KEYS.gsi2.indexName,
          pk: { field: DDB_KEYS.gsi2.partitionKey, composite: [] },
          sk: { field: DDB_KEYS.gsi2.sortKey, composite: ['organizationId'] },
        },
      },
    },
    configuration
  );

  /**
   * Create an organization in the system.
   * @param ownerId The id of the user that will be the owner of the organization
   * @param organizationName The name of the organization
   * @param ownerRole The name of the owner role in the organization, defaults
   *                  to 'owner'
   * @returns
   */
  async function createOrganization(
    ownerId: string,
    organizationName: string,
    ownerRole: Roles = 'owner' as Roles
  ) {
    if (!ownerId) {
      throw new ValidationException(
        'ownerId is required to create an organization.'
      );
    }

    // TODO: We have to cast to any because at this point, TS is still unsure as to what could be
    // in the schema.
    const res = await OrganizationEntity.create({
      organizationId: generateId('orgs'),
      name: organizationName,
    } as any).go();

    /** Create the organization and user connection */
    await OrganizationUserEntity.create({
      // TODO: We have to cast to any because at this point, TS is still unsure as to what could be
      // in the schema.
      organizationId: (res.data as any).organizationId,
      userId: ownerId,
      // The role should be owner as they are the one that is creating the organization
      role: ownerRole,
    }).go();

    return res.data;
  }

  /**
   * List all organizations that a user belongs to.
   * @param userId The id of the user to list organizations for
   * @returns
   */
  async function listOrganizationByUserId(userId: string) {
    const orgs = await OrganizationUserEntity.query
      .organizationForUsers({ userId })
      .go();

    return orgs.data;
  }

  /**
   * List all users in a particular organization
   * @param organizationId The id of the organization to list users for
   * @returns
   */
  async function listAllUsersInOrganization(organizationId: string) {
    const users = await OrganizationUserEntity.query
      .usersInOrganization({ organizationId })
      .go({ pages: 'all' });

    return users.data;
  }

  /**
   * Check whether or not a user is a member of a  particular organization
   * @param userId The id of the user to check
   * @param organizationId The id of the organization to check
   * @returns
   */
  async function checkUserInOrganization(
    userId: string,
    organizationId: string
  ) {
    const orgs = await OrganizationUserEntity.query
      .usersInOrganization({ userId, organizationId })
      .go();

    return orgs.data.length > 0;
  }

  /**
   * Creates a user and an organization automatically. This by defaults sets
   * every user to be an owner of their own organization.
   */
  async function createUserAndOrganization(
    ...params: Parameters<typeof Users.createThroughAuthProvider>
  ) {
    // Create the user
    const user = await Users.createThroughAuthProvider(...params);

    // Create the organization for that user to belong in
    const organization = await createOrganization(
      user.userId,
      `${user.fullName || user.firstName || 'New users'}'s organization`
    );

    return { user, organization };
  }

  /**
   * A wrapper around adding the auth provider to a user that also returns the
   * organization that the user belongs to.
   */
  async function addAuthProviderToUser(
    ...params: Parameters<typeof Users.addAuthProviderToUser>
  ) {
    const user = await Users.addAuthProviderToUser(...params);

    const orgList = await listOrganizationByUserId(user.userId);

    return { user, organizations: orgList };
  }

  /**
   * Add user to an organization
   * @param userId The id of the user to add
   * @param organizationId The id of the organization to add the user to
   * @param role The role of the user in the organization
   * @returns
   */
  async function addUserToOrganization(
    userId: string,
    organizationId: string,
    role: Roles
  ) {
    const res = await OrganizationUserEntity.create({
      organizationId,
      userId,
      role,
    }).go();

    const orgList = await listOrganizationByUserId(userId);

    return { userId, organizations: orgList };
  }

  /**
   * List all organizations in the system
   */
  async function listAllOrganizations() {
    const orgs = await OrganizationUserEntity.query
      .allOrganizations({})
      .go({ pages: 'all' });

    return orgs.data;
  }

  return {
    OrganizationEntity,
    OrganizationUserEntity,
    createOrganization,
    listOrganizationByUserId,
    listAllOrganizations,
    listAllUsersInOrganization,
    checkUserInOrganization,
    createUserAndOrganization,
    addAuthProviderToUser,
    addUserToOrganization,
  };
};
