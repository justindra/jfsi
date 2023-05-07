import { Entity, EntityItem, EntityConfiguration, Schema } from 'electrodb';
import { AUDIT_FIELDS } from './defaults.js';
import { generateId } from './utils.js';

type GenerateChatEntityDetailsParams<S extends Schema<string, string, string>> =
  {
    version?: string;
    service: string;
    chatConfig: S;
  };

/**
 * Generate the ElectroDB configuration for a chat system implementation. This
 * is made specifically for a chat between a user and an AI assistant, but it
 * can be extended as a chat between multiple users as well.
 *
 * This configuration creates a single entity:
 *  - Chat - The chat entity
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
export const generateChatEntityDetails = <
  A extends string,
  F extends string,
  C extends string,
  S extends Schema<A, F, C>
>(
  configuration: EntityConfiguration,
  { version = '1', service, chatConfig }: GenerateChatEntityDetailsParams<S>
) => {
  const ChatEntity = new Entity(
    {
      model: {
        version,
        service,
        entity: 'chat',
      },
      attributes: {
        ...AUDIT_FIELDS,
        chatId: {
          type: 'string',
          required: true,
          readOnly: true,
        },
        messages: {
          type: 'list',
          required: true,
          default: [],
          items: {
            type: 'map',
            properties: {
              /** The role determines who sent that message */
              role: {
                type: ['system', 'user', 'assistant'] as const,
                required: true,
              },
              content: { type: 'string', required: true },
              /** The id of the user that sent this message, if any */
              userId: { type: 'string' },
              /** The time the message was sent in as an ISO date */
              timestamp: { type: 'string' },
            },
          },
        },
        /**
         * Whether or not a request to the OpenAI API is running or not. Because
         * the OpenAI calls can be really long, we just want to save this here.
         *
         * - idle - The chat is not waiting for anything, new messages can be added.
         * - awaiting - The chat is waiting to be actioned
         * - processing - The call to OpenAI has been made and is in progress
         */
        status: {
          type: ['idle', 'awaiting', 'processing'] as const,
          required: true,
        },
        ...((chatConfig?.attributes || {}) as S['attributes']),
      },
      indexes: {
        ...((chatConfig?.indexes || {}) as S['indexes']),
      },
    },
    configuration
  );

  type CreateChatParams = Parameters<(typeof ChatEntity)['create']>[0];

  /**
   * Create a chat with the given parameters
   * @param params The parameters to create a chat with
   * @returns
   */
  async function createChat(params: CreateChatParams) {
    const chat = await ChatEntity.create({
      ...params,
      chatId: generateId('chat'),
      status: 'idle',
    }).go();

    return chat.data;
  }

  /**
   * Update the chat message at the given index, this is used for when we are
   * streaming results from OpenAI.
   * @param index The index of the message to update
   * @param message The message to update
   * @returns
   */
  function updateMessageAtIndex(
    updateCall: ReturnType<(typeof ChatEntity)['update']>,
    index: number,
    message: string
  ) {
    return updateCall.data(({ messages }: any, { set }) => {
      set(messages[index].content, message);
    });
  }

  type Message = {
    role: 'assistant' | 'user' | 'system';
    content: string;
    userId?: string;
    timestamp?: string;
  };

  /**
   * We want to set the chat to be processed by the OpenAI API. This will
   * set the status to waiting and add the message to the chat.
   * @param updateCall The the call to ElectroDB update
   * @param message The message to add to the chat
   * @returns
   */
  function setMessageToBeProcessed(
    updateCall: ReturnType<(typeof ChatEntity)['update']>,
    // TODO: fix typing issue
    // message: Info['messages'][number],
    message: Message
  ) {
    return updateCall
      .append({ messages: [message] } as any)
      .set({ status: 'awaiting' } as any);
  }

  /**
   * The chat is currently being processed by OpenAI. We want to set the status
   * to processing so we don't try to process it again.
   * @returns
   */
  function setMessageToBeProcessing(
    updateCall: ReturnType<(typeof ChatEntity)['update']>
  ) {
    return updateCall
      .set({ status: 'processing' } as any)
      .append({ messages: [{ role: 'assistant', content: '' }] } as any);
  }

  /**
   * The message has been processed by the OpenAI API and we want to update
   * the chat with the new messages. This will set the status to idle.
   * @param messages The messages to add to the chat
   * @returns
   */
  function completeMessageProcessing(
    updateCall: ReturnType<(typeof ChatEntity)['update']>,
    // messages: Info['messages'],
    messages: Message[]
  ) {
    return updateCall.set({ messages, status: 'idle' } as any);
  }

  /**
   * Clean the chat of any system messages so we don't let the users know what
   * our prompt is.
   * @param chat The chat entity to clean
   * @returns
   */
  function cleanChat(chat: EntityItem<typeof ChatEntity>) {
    return {
      ...chat,
      messages: (chat as any).messages
        .filter((val: any) => val.role !== 'system')
        // remove any continue messages
        .filter((val: any) => val.content !== 'continue')
        // merge any immediate messages from the same role
        .reduce((acc: any, val: any) => {
          const last = acc[acc.length - 1];
          if (last && last.role === val.role) {
            last.content = `${last.content}${val.content}`;
            return acc;
          } else {
            return [...acc, val];
          }
          // }, [] as Info['messages']),
        }, [] as any),
    };
  }

  return {
    ChatEntity,
    createChat,
    updateMessageAtIndex,
    setMessageToBeProcessed,
    setMessageToBeProcessing,
    completeMessageProcessing,
    cleanChat,
  };
};
