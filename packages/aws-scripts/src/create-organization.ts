/**
 * This script is used to create a new AWS organization as a sub-account of the
 * root account. It also automatically assigns access to a group named "Admin"
 * through AWS IAM Identity Centre (the successor to AWS SSO).
 *
 * The steps are as follows:
 * 1. Create the AWS Organization
 * 2. Find the Admin Group
 * 3. Assign the group to the newly created organization.
 */

import {
  Account,
  CreateAccountCommand,
  ListAccountsCommand,
  OrganizationsClient,
} from '@aws-sdk/client-organizations';
import {
  IdentitystoreClient,
  ListGroupsCommand,
  Group,
} from '@aws-sdk/client-identitystore';
import {
  SSOAdminClient,
  ListInstancesCommand,
  ListPermissionSetsCommand,
  CreateAccountAssignmentCommand,
} from '@aws-sdk/client-sso-admin';

const NAME = 'unbind';

const orgClient = new OrganizationsClient({
  region: 'us-east-1',
});
const identityStoreClient = new IdentitystoreClient({ region: 'us-west-2' });
const ssoAdminClient = new SSOAdminClient({ region: 'us-west-2' });

async function findOrganization(name: string): Promise<Account | null> {
  const existingAccounts = await orgClient.send(new ListAccountsCommand({}));

  const existingAccount = existingAccounts.Accounts?.find(
    (val) => val.Name?.toLowerCase() === name.toLowerCase()
  );

  console.log(existingAccounts);
  if (existingAccount) {
    return existingAccount;
  }

  return null;
}

async function findOrCreateOrganization(name: string): Promise<Account> {
  const existingAccount = await findOrganization(name);
  if (existingAccount) {
    return existingAccount;
  }

  console.log(`No existing account found for "${name}", creating...`);

  const createOrgParam = new CreateAccountCommand({
    AccountName: name,
    Email: `hello+${name}@justindra.com`,
  });

  const organization = await orgClient.send(createOrgParam);

  console.log(JSON.stringify(organization));
  if (organization.CreateAccountStatus?.State === 'IN_PROGRESS') {
    console.log('Waiting for account to be created...');
    // Wait 10 seconds and hopefully it should be ready by then
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  return findOrganization(name) as Account;
}

async function getIdentityStoreInstance() {
  const instances = await ssoAdminClient.send(new ListInstancesCommand({}));

  if (!instances.Instances?.length) {
    throw new Error(
      'No instances found, make sure to have identity store instance in your root account.'
    );
  }

  return instances['Instances'][0];
}

async function findAdminGroup(identitystoreId: string): Promise<Group | null> {
  const groups = await identityStoreClient.send(
    new ListGroupsCommand({
      IdentityStoreId: identitystoreId,
    })
  );

  const adminGroup = groups.Groups?.find(
    (val) => val.DisplayName?.toLowerCase() === 'admin'
  );

  console.log(groups);
  if (adminGroup) {
    return adminGroup;
  }

  return null;
}

async function assignGroupToOrganization(
  identityStoreArn: string,
  groupId: string,
  organizationId: string
) {
  const permissionSets = await ssoAdminClient.send(
    new ListPermissionSetsCommand({ InstanceArn: identityStoreArn })
  );

  if (!permissionSets.PermissionSets?.length) {
    throw new Error(
      'No permission sets found, make sure to have permission sets in your root account.'
    );
  }

  console.log(permissionSets);

  return ssoAdminClient.send(
    new CreateAccountAssignmentCommand({
      InstanceArn: identityStoreArn,
      PrincipalId: groupId,
      PrincipalType: 'GROUP',
      TargetId: organizationId,
      TargetType: 'AWS_ACCOUNT',
      PermissionSetArn: permissionSets.PermissionSets[0],
    })
  );
}

const instance = await getIdentityStoreInstance();

const org = await findOrCreateOrganization(NAME);
console.log(`Created organization: ${org}`);

const group = await findAdminGroup(instance.IdentityStoreId || '');
console.log(`Found admin group: ${group?.GroupId}`);

const assignment = await assignGroupToOrganization(
  instance.InstanceArn || '',
  group?.GroupId || '',
  org.Id || ''
);
console.log(`Assigned admin group to organization: ${assignment}`);
