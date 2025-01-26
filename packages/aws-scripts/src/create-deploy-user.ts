/**
 * Create a deploy user for an AWS Account and returns the access key and secret.
 *
 * Make sure to set the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment
 * variables before running this command. You can do this through AWS SSO.
 */
import {
  CreateAccessKeyCommand,
  IAMClient,
  CreateGroupCommand,
  AttachGroupPolicyCommand,
  ListGroupsCommand,
  CreateUserCommand,
  AddUserToGroupCommand,
} from '@aws-sdk/client-iam';
import { fromIni } from '@aws-sdk/credential-providers';

const PROFILE = process.argv[2] || 'default';

const credentials = fromIni({ profile: PROFILE });

const iamClient = new IAMClient({ region: 'us-east-1', credentials });

const AWS_POLICIES_TO_ATTACH = [
  'arn:aws:iam::aws:policy/AdministratorAccess',
  'arn:aws:iam::aws:policy/AWSCloudFormationFullAccess',
];

async function createGroup(name: string) {
  const existingGroups = await iamClient.send(new ListGroupsCommand({}));

  const existingGroup = existingGroups.Groups?.find(
    (val) => val.GroupName?.toLowerCase() === name.toLowerCase()
  );
  if (existingGroup) {
    return existingGroup;
  }
  const group = await iamClient.send(
    new CreateGroupCommand({ GroupName: name })
  );

  for (const policy of AWS_POLICIES_TO_ATTACH) {
    await iamClient.send(
      new AttachGroupPolicyCommand({
        GroupName: group.Group?.GroupName,
        PolicyArn: policy,
      })
    );
  }

  return group.Group;
}

// Create the group
const group = await createGroup('deploy');

// Create the user
const user = await iamClient.send(
  new CreateUserCommand({ UserName: 'sst-deploy' })
);

// Add the user to the group
await iamClient.send(
  new AddUserToGroupCommand({
    GroupName: group?.GroupName,
    UserName: user?.User?.UserName,
  })
);

// Create the access key
const accessKey = await iamClient.send(
  new CreateAccessKeyCommand({ UserName: user?.User?.UserName })
);

// Print out the access key and secret
console.log(accessKey.AccessKey);
