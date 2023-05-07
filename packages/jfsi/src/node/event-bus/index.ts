import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { EventBridgeHandler } from 'aws-lambda';

export interface EventBusEvents {}

export type EventTypes = keyof EventBusEvents;

/**
 * A wrapper around an Event Bridge Event Handler that will catch any errors
 * and send them to Sentry.
 * @param handler The handler function
 */
export function EventBridgeWrapper<T extends EventTypes>(
  handler: EventBridgeHandler<EventTypes, EventBusEvents[T], any>
) {
  return handler;
}

const EBClient = new EventBridgeClient({});

/**
 * Generate helper functions for publishing events to EventBridge.
 * @param source The source to use
 * @param eventBusName The name of the event bus to use
 * @returns
 */
export function generateEventBusHelpers<T extends EventTypes>(
  source: string,
  eventBusName: string
) {
  /**
   * Publish an event to EventBridge.
   * @param type The type of event, e.g. 'users.created' or 'notifications.sent'
   * @param properties The properties of the event to send, e.g. the userId
   */
  async function publishEvent(type: T, properties: EventBusEvents[T]) {
    const command = new PutEventsCommand({
      Entries: [
        {
          EventBusName: eventBusName,
          Source: source,
          DetailType: type,
          Detail: JSON.stringify(properties),
        },
      ],
    });
    return EBClient.send(command);
  }

  return { publishEvent };
}
