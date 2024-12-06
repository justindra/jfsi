/**
 * This script is used to point a subdomain to the nameservers of a domain.
 */

import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
  GetHostedZoneCommand,
  ListHostedZonesByNameCommand,
} from '@aws-sdk/client-route-53';
import { fromIni } from '@aws-sdk/credential-providers';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import * as fs from 'fs';

const args = await yargs(hideBin(process.argv)).argv;

if (!args.subdomain) {
  throw new Error('Missing --subdomain argument');
}

const DOMAIN = (args.subdomain as string).split('.').slice(1).join('.');

const PROFILE = (args.profile as string) || 'default';

const credentials = fromIni({ profile: PROFILE });

const client = new Route53Client({ region: 'us-east-1', credentials });

const hostedZones = await client.send(new ListHostedZonesByNameCommand({}));

const hostedZone = hostedZones.HostedZones?.find(
  (zone) => zone.Name === `${DOMAIN}.`
);

if (!hostedZone) {
  throw new Error(`Hosted zone for ${DOMAIN} not found`);
}

const hostedZoneId = hostedZone.Id?.split('/').pop();

if (!hostedZoneId) {
  throw new Error('Hosted zone ID not found');
}

const res = await client.send(
  new GetHostedZoneCommand({
    Id: hostedZoneId,
  })
);

const nameservers: string[] = JSON.parse(
  fs.readFileSync(`./temp/${args.subdomain}-ns.json`, 'utf8')
);

if (!nameservers) {
  throw new Error('Nameservers not found');
}

const change = await client.send(
  new ChangeResourceRecordSetsCommand({
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Changes: [
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: `${args.subdomain}.`,
            Type: 'NS',
            TTL: 60,
            ResourceRecords: nameservers.map((ns) => ({ Value: ns })),
          },
        },
      ],
    },
  })
);

console.log(JSON.stringify(change));
