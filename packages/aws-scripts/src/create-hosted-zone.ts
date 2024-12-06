/**
 * Create a hosted zone in Route53 for a given domain name.
 *
 * Usage:
 * $ pnpm run tsx ./src/create-hosted-zone.ts --domain example.com
 */
import {
  Route53Client,
  CreateHostedZoneCommand,
} from '@aws-sdk/client-route-53';
import { fromIni } from '@aws-sdk/credential-providers';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import fs from 'fs';

const args = await yargs(hideBin(process.argv)).argv;

if (!args.domain) {
  throw new Error('Missing --domain argument');
}

const PROFILE = (args.profile as string) || 'default';

const credentials = fromIni({ profile: PROFILE });

const client = new Route53Client({ region: 'us-east-1', credentials });

const res = await client.send(
  new CreateHostedZoneCommand({
    Name: args.domain as string,
    CallerReference: new Date().toISOString(),
  })
);

console.log(JSON.stringify(res));

// Save nameservers to a JSON file so it can be used in other scripts
const nameservers = res.DelegationSet?.NameServers;
if (nameservers) {
  const tempFolderPath = './temp';
  const jsonFilePath = `${tempFolderPath}/${args.domain}-ns.json`;
  fs.writeFileSync(jsonFilePath, JSON.stringify(nameservers));
  console.log(`Nameservers saved to ${jsonFilePath}`);
} else {
  console.log('No nameservers found');
}
