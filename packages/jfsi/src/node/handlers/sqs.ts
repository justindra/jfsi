import type { SQSEvent } from 'aws-lambda';

/**
 * A wrapper around the SQS handler to parse the body as JSON and it should
 * automatically cycle through all the records in the queue as provided.
 * @param handler The handler function that will be called for each record in
 *                the queue
 */
export const SqsHandler = <TBody = any>(
  handler: (body: TBody) => Promise<void>
) => {
  return async (event: SQSEvent) => {
    await Promise.all(
      event.Records.map(async (record) => {
        const parsedBody: TBody = record.body ? JSON.parse(record.body) : {};
        await handler(parsedBody);
      })
    );
  };
};
