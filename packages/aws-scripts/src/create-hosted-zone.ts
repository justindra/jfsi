/**
 * Create a hosted zone in Route53 for a given domain name.
 */
import {
  Route53Client,
  CreateHostedZoneCommand,
} from '@aws-sdk/client-route-53';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

const args = await yargs(hideBin(process.argv)).argv;

if (!args.domain) {
  throw new Error('Missing --domain argument');
}

const client = new Route53Client({ region: 'us-east-1' });

const res = await client.send(
  new CreateHostedZoneCommand({
    Name: args.domain as string,
    CallerReference: new Date().toISOString(),
  })
);

console.log(res);
