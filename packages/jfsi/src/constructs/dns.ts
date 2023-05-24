import { Duration } from 'aws-cdk-lib';
import { HostedZone, MxRecord, TxtRecord } from 'aws-cdk-lib/aws-route53';
import type { StackContext } from 'sst/constructs';
import { isProduction } from './stage.js';

type GoogleDNSRecordsParams = {
  domainName: string;
  googleWorkspaceDomainVerification?: string;
  googleSearchConsoleDomainVerification?: string;
  enableGmail?: boolean;
};

export class GoogleDNSRecords {
  constructor(
    { app, stack }: StackContext,
    id: string,
    {
      domainName,
      googleSearchConsoleDomainVerification,
      googleWorkspaceDomainVerification,
      enableGmail,
    }: GoogleDNSRecordsParams
  ) {
    if (!isProduction(app.stage)) return;

    const hostedZone = HostedZone.fromLookup(stack, `${id}RootHostedZone`, {
      domainName,
    });

    const domainVerificationValues: string[] = [];
    if (googleSearchConsoleDomainVerification)
      domainVerificationValues.push(googleSearchConsoleDomainVerification);
    if (googleWorkspaceDomainVerification)
      domainVerificationValues.push(googleWorkspaceDomainVerification);

    // If domain verfication values were provided, then set them all
    if (domainVerificationValues.length) {
      new TxtRecord(stack, `${id}SiteVerificationRecords`, {
        zone: hostedZone,
        values: domainVerificationValues,
        ttl: Duration.days(1),
        comment: 'Google Site Verification',
      });
    }

    if (enableGmail) {
      // Gmail MX records for Google Workspace
      new MxRecord(stack, `${id}GmailMxRecord`, {
        zone: hostedZone,
        values: [
          { hostName: 'ASPMX.L.GOOGLE.COM.', priority: 1 },
          { hostName: 'ALT1.ASPMX.L.GOOGLE.COM.', priority: 5 },
          { hostName: 'ALT2.ASPMX.L.GOOGLE.COM.', priority: 5 },
          { hostName: 'ALT3.ASPMX.L.GOOGLE.COM.', priority: 10 },
          { hostName: 'ALT4.ASPMX.L.GOOGLE.COM.', priority: 10 },
        ],
        ttl: Duration.days(1),
        comment: 'Gmail MX Records',
      });
    }
  }
}
