import { Entity, EntityItem, EntityConfiguration } from 'electrodb';
import { AUDIT_FIELDS, DDB_KEYS } from './defaults.js';
import { generateId } from './utils.js';

type GenerateUserEntityDetailsParams = {
  version?: string;
  service: string;
};

/**
 * Generate the ElectroDB configuration for a standard user and authentication
 * implementation. This is pretty basic and is always consistently the same for
 * most of the applications I've created.
 *
 * This configuration creates 3 different entities:
 *  - User - The user itself
 *  - UserEmail - The user and email combination, this is used to ensure an
 *                email is unique to each user. Users are allowed to have
 *                multiple emails, but an email can only belong to a single
 *                user.
 *  - UserAuth - The user and auth provider combination, e.g. Google, FB, etc.
 *               Allows the user to have multiple auth provider configs, but a
 *               single provider config should only ever be attached to a
 *               single user.
 *
 * Please ensure the dynamodb table has the following indexes set:
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
 * @returns
 */
export const generateUserEntityDetails = (
  configuration: EntityConfiguration,
  { version = '1', service }: GenerateUserEntityDetailsParams
) => {
  /**
   * The user entity is what describes a user in the system. A user is
   * automatically created when they login using an auth provider the first time.
   */
  const UserEntity = new Entity(
    {
      model: {
        version,
        entity: 'user',
        service,
      },
      attributes: {
        ...AUDIT_FIELDS,
        userId: {
          type: 'string',
          required: true,
          readOnly: true,
        },
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
        fullName: {
          type: 'string',
          // never set value to the database
          set: () => undefined,
          // calculate full name on retrieval
          get: (_, { firstName, lastName }) => {
            return `${firstName ?? ''} ${lastName ?? ''}`.trim();
          },
        },
        avatarUrl: {
          type: 'string',
        },
      },
      indexes: {
        user: {
          pk: {
            field: DDB_KEYS.defaultIndex.partitionKey,
            composite: ['userId'],
          },
          sk: { field: DDB_KEYS.defaultIndex.sortKey, composite: [] },
        },
      },
    },
    configuration
  );

  /**
   * The user email entity describes the user to email relationship. A user can
   * have multiple emails, but a single email should only ever be attached to one
   * user.
   */
  const UserEmailEntity = new Entity(
    {
      model: {
        version,
        entity: 'user-email',
        service,
      },
      attributes: {
        ...AUDIT_FIELDS,
        userId: {
          type: 'string',
          required: true,
          readOnly: true,
        },
        email: {
          type: 'string',
          required: true,
          readOnly: true,
        },
      },
      indexes: {
        userForEmails: {
          pk: {
            field: DDB_KEYS.defaultIndex.partitionKey,
            composite: ['userId'],
          },
          sk: { field: DDB_KEYS.defaultIndex.sortKey, composite: ['email'] },
        },
        emailsForUser: {
          index: DDB_KEYS.gsi1.indexName,
          pk: { field: DDB_KEYS.gsi1.partitionKey, composite: ['email'] },
          sk: { field: DDB_KEYS.gsi1.sortKey, composite: ['userId'] },
        },
      },
    },
    configuration
  );

  /**
   * The user auth entity is what describes a user's auth provider. A user can
   * have multiple auth providers, but a single auth provider should only ever be
   * attached to one user.
   */
  const UserAuthEntity = new Entity(
    {
      model: {
        version,
        entity: 'user-auth',
        service,
      },
      attributes: {
        ...AUDIT_FIELDS,
        userId: {
          type: 'string',
          required: true,
          readOnly: true,
        },
        authProviderId: {
          type: 'string',
          required: true,
        },
        authProvider: {
          type: [
            'google',
            'spotify',
            'jobber',
            'facebook',
            'github',
            'link',
            'code',
          ] as const,
          required: true,
        },
        /**
         * Some auth providers divide their users into separate accounts or
         * organizations. This will helps us keep track of this if required.
         */
        authProviderAccountId: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
        tokenExpiresAt: {
          type: 'number',
        },
      },
      indexes: {
        providersForUsers: {
          pk: {
            field: DDB_KEYS.defaultIndex.partitionKey,
            composite: ['userId'],
          },
          sk: {
            field: DDB_KEYS.defaultIndex.sortKey,
            composite: ['authProviderId'],
          },
        },
        usersForProviders: {
          index: DDB_KEYS.gsi1.indexName,
          pk: {
            field: DDB_KEYS.gsi1.partitionKey,
            composite: ['authProviderId'],
          },
          sk: { field: DDB_KEYS.gsi1.sortKey, composite: ['userId'] },
        },
      },
    },
    configuration
  );

  type Info = EntityItem<typeof UserEntity>;

  type UserAuthInfo = EntityItem<typeof UserAuthEntity>;

  /**
   * Get a user by it's id
   * @param userId The userId to get
   * @returns
   */
  async function getUserById(userId: string) {
    const user = await UserEntity.get({ userId }).go();
    return user.data;
  }

  /**
   * Get a user by it's email
   * @param email The email to get
   * @returns
   */
  async function getUserIdByEmail(email?: string) {
    if (!email) return null;
    // Get the userId based on the email
    const userEmail = await UserEmailEntity.query.emailsForUser({ email }).go();

    // If there were none, then return null.
    if (!userEmail.data.length) {
      return null;
    }

    // Just in case we find more than 1, we want to just log it out for now.
    // Eventually we may need to handle it by sending it to Sentry or something.
    if (userEmail.data.length > 1) {
      console.warn(
        `Found more than 1 user for auth provider id ${email}. Returning first user.`
      );
    }

    // There should only ever be a single email attached to a single user, so we
    // just return the first one.
    return userEmail.data[0].userId;
  }

  /**
   * Get a user by their auth provider and auth provider id
   * @param authProvider The auth provider for this user
   * @param authProviderId The auth provider id to search for
   * @returns The user
   */
  async function getUserIdByAuthProviderId(
    authProvider: UserAuthInfo['authProvider'],
    authProviderId: string
  ) {
    const idToUse = `${authProvider}|${authProviderId}`;

    const userAuth = await UserAuthEntity.query
      .usersForProviders({ authProviderId: idToUse })
      .go();
    // If no user is found, return null
    if (!userAuth.data.length) return null;

    // Just in case we find more than 1, we want to just log it out for now.
    // Eventually we may need to handle it by sending it to Sentry or something.
    if (userAuth.data.length > 1) {
      console.warn(
        `Found more than 1 user for auth provider id ${idToUse}. Returning first user.`
      );
    }

    // Since auth provider(s) should only ever have 1 user attached to it, we
    // can safely assume the first item in the array is the user we want.
    return userAuth.data[0].userId;
  }

  type CreateThroughAuthProviderParams = Omit<Info, 'userId'> &
    Omit<UserAuthInfo, 'userId'>;

  /**
   * Create a user through an auth provider's response and save it into the database.
   * @param params The params to create the user with
   * @returns
   */
  async function createThroughAuthProvider(
    params: CreateThroughAuthProviderParams
  ) {
    // Check if the auth provider id is already attached to a user or not
    let user: Info | null = null;

    const userIdFromEmail = await getUserIdByEmail(params.email);
    const userIdFromAuthProvider = await getUserIdByAuthProviderId(
      params.authProvider,
      params.authProviderId
    );
    // Whether or not we found a user by the email
    const fromEmail = !!userIdFromEmail;
    // Whether or not we found a user by the auth provider id
    const fromAuthProvider = !!userIdFromAuthProvider;

    if (
      fromEmail &&
      fromAuthProvider &&
      userIdFromEmail !== userIdFromAuthProvider
    ) {
      console.error(
        `UserIds don't match! ${userIdFromEmail} !== ${userIdFromAuthProvider}`
      );
    }

    if (fromEmail || fromAuthProvider) {
      user = await getUserById(
        (userIdFromEmail || userIdFromAuthProvider) as string
      );
    }

    // Still no user, then let's create a new one
    if (!user) {
      user = (
        await UserEntity.create({
          firstName: params.firstName,
          lastName: params.lastName,
          userId: generateId('user'),
          avatarUrl: params.avatarUrl,
        }).go()
      ).data;
    }

    // Only create the email entity if it doesn't already exist
    if (!fromEmail && params.email) {
      await UserEmailEntity.create({
        userId: user.userId,
        email: params.email,
      }).go();
    }

    // Only create authprovider entity if it doesn't already exist
    if (!fromAuthProvider) {
      await UserAuthEntity.create({
        userId: user.userId,
        authProviderId: `${params.authProvider}|${params.authProviderId}`,
        authProvider: params.authProvider,
        email: params.email,
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,
        tokenExpiresAt: params.tokenExpiresAt,
      }).go();
    }

    return user;
  }

  /**
   * Add a new auth provider to an existing user as specified by the userId
   * @param params The params to add the auth provider to the user
   * @returns
   */
  async function addAuthProviderToUser(params: UserAuthInfo) {
    // Get the user
    const user = await getUserById(params.userId);

    // If the user doesn't exist, then throw an error
    if (!user) {
      throw new Error(`User with id ${params.userId} does not exist`);
    }

    const userIdFromAuthProvider = await getUserIdByAuthProviderId(
      params.authProvider,
      params.authProviderId
    );

    // If the auth provider already exists for another user, then throw an error
    // Otherwise, just return the user
    if (userIdFromAuthProvider) {
      if (userIdFromAuthProvider !== user.userId) {
        throw new Error('Auth provider already exists for another user');
      }

      // If the auth provider already exists for this user, make sure to update
      // the tokens and then return the user
      await UserAuthEntity.update({
        userId: user.userId,
        authProviderId: `${params.authProvider}|${params.authProviderId}`,
      })
        .set({
          accessToken: params.accessToken,
          refreshToken: params.refreshToken,
          tokenExpiresAt: params.tokenExpiresAt,
        })
        .go();
      return user;
    }

    // If an email was provided, then just double check that it's not already
    // attached to another user. And then create the email entity.
    if (params.email) {
      const userIdFromEmail = await getUserIdByEmail(params.email);
      if (userIdFromEmail && userIdFromEmail !== params.userId) {
        throw new Error('Email already exists for another user');
      }
      if (!userIdFromEmail) {
        await UserEmailEntity.create({
          userId: params.userId,
          email: params.email,
        }).go();
      }
    }

    // Create the auth provider entity
    await UserAuthEntity.create({
      userId: user.userId,
      authProviderId: `${params.authProvider}|${params.authProviderId}`,
      authProvider: params.authProvider,
      email: params.email,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      tokenExpiresAt: params.tokenExpiresAt,
    }).go();

    return user;
  }

  /**
   * Delete a user. This should also delete any AuthEntities and EmailEntities
   * related to that user.
   * @param userId The userId to delete
   * @returns
   */
  async function deleteUser(userId: string) {
    const auths = await UserAuthEntity.query.providersForUsers({ userId }).go();

    await Promise.all(
      auths.data.map((auth) =>
        UserAuthEntity.delete({
          userId: auth.userId,
          authProviderId: auth.authProviderId,
        }).go()
      )
    );

    const emails = await UserEmailEntity.query.userForEmails({ userId }).go();

    await Promise.all(
      emails.data.map((email) =>
        UserEmailEntity.delete({
          userId: email.userId,
          email: email.email,
        }).go()
      )
    );

    await UserEntity.delete({ userId }).go();
    return null;
  }

  /**
   * Get the list of emails for a particular user
   * @param userId The user id to check
   * @returns
   */
  async function getEmailsForUserId(userId: string): Promise<string[]> {
    const user = await UserEmailEntity.query.userForEmails({ userId }).go();
    return user.data.map((item) => item.email);
  }

  return {
    UserEntity,
    UserAuthEntity,
    UserEmailEntity,
    getUserById,
    getUserIdByAuthProviderId,
    getUserIdByEmail,
    createThroughAuthProvider,
    deleteUser,
    addAuthProviderToUser,
    getEmailsForUserId,
  };
};
