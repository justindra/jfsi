import type { IncomingMessage } from 'http';
import {
  ChatCompletionResponseMessage,
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
  CreateChatCompletionResponse,
  CreateChatCompletionRequest,
} from 'openai';
import { Config } from 'sst/node/config';

if (!(Config as any).OPENAI_API_KEY) {
  console.warn('Please bind the OPENAI_API_KEY secret to the function.');
}

const openAIConfig = new Configuration({
  apiKey: (Config as any).OPENAI_API_KEY,
});

const openai = new OpenAIApi(openAIConfig);

const DEFAULT_OPENAI_PARAMS = {
  model: (Config as any).STAGE === 'prod' ? 'gpt-4' : 'gpt-3.5-turbo',
};

/**
 * For the time being, we are only going to allow 10 messages to be sent to the
 * OpenAI API. This is because the API is currently in beta, and we don't want
 * to send too many requests. Plus, it starts to get really expensive after 10
 * messages.
 *
 * The downside is that it won't be able to remember all of the context of the
 * conversation, but that's okay for now. We can re-adjust as we see fit.
 * @param messages The messages to reduce
 * @param maxMessages The maximum number of messages to allow
 * @returns
 */
const reduceMessages = (
  messages: ChatCompletionRequestMessage[],
  maxMessages: number = 10
) => {
  // If there are less than the maximum allowed, then return the messages
  if (messages.length <= maxMessages) {
    return messages;
  }
  // Get the system messages, as that is important
  const systemMessages = messages.filter(
    (message) => message.role === 'system'
  );

  // Otherwise, get the last 10 messages
  return [
    // Just assume that system messages are always at the front
    ...systemMessages,
    ...messages.slice(
      systemMessages.length - (maxMessages + systemMessages.length)
    ),
  ];
};

type Usage = {
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
};

type GetResponseResult = {
  usage: Usage;
  messages: ChatCompletionResponseMessage[];
};

export async function getResponse(
  prompts: ChatCompletionRequestMessage[],
  prevUsage: Usage = { completionTokens: 0, promptTokens: 0, totalTokens: 0 },
  openAIParams: Partial<CreateChatCompletionRequest> & {
    model: string;
  } = DEFAULT_OPENAI_PARAMS
): Promise<GetResponseResult> {
  const response = await openai.createChatCompletion({
    ...openAIParams,
    messages: reduceMessages(
      prompts.map((message) => ({
        role: message.role,
        content: message.content,
      }))
    ),
  });

  if (response.data.choices.length === 0) {
    throw new Error('Oops, something went wrong...');
  }

  const finishReason = response.data.choices[0].finish_reason;

  if (finishReason === null) {
    throw new Error('Oops, something went wrong...');
  }

  if (finishReason === 'content_filter') {
    throw new Error(
      'The content has been flagged as inappropriate. Please try again.'
    );
  }

  // Calculate the usage so far
  const usage = {
    completionTokens:
      prevUsage.completionTokens +
      (response.data.usage?.completion_tokens || 0),
    promptTokens:
      prevUsage.promptTokens + (response.data.usage?.prompt_tokens || 0),
    totalTokens:
      prevUsage.totalTokens + (response.data.usage?.total_tokens || 0),
  };

  // If the reason for finishing is the length, then get it to continue the response
  if (finishReason === 'length') {
    return getResponse(
      [
        ...prompts,
        response.data.choices[0].message || { role: 'assistant', content: '' },
        { role: 'user', content: 'continue' },
      ],
      usage
    );
  }

  return {
    messages: [
      ...prompts,
      response.data.choices[0].message || { role: 'assistant', content: '' },
    ],
    usage,
  };
}

function updateMessageWithDelta(
  message: ChatCompletionResponseMessage,
  delta: Partial<ChatCompletionRequestMessage>
) {
  return {
    role: delta.role || message.role,
    content: delta.content ? message.content + delta.content : message.content,
  };
}

type ChatCompletionStreamResponseMessage = Omit<
  CreateChatCompletionResponse,
  'choices' | 'object' | 'usage'
> & {
  object: 'chat.completion.chunk';
  choices: {
    delta: Partial<ChatCompletionResponseMessage>;
    index: 0;
    finish_reason: null;
  }[];
};

export async function getResponseStream(
  prompts: ChatCompletionRequestMessage[],
  streamUpdate: (message: ChatCompletionResponseMessage) => void,
  openAIParams: Partial<CreateChatCompletionRequest> & {
    model: string;
  } = DEFAULT_OPENAI_PARAMS
): Promise<GetResponseResult> {
  return new Promise(async (resolve, reject) => {
    let res: ChatCompletionResponseMessage = { role: 'assistant', content: '' };
    let count: number = 0;

    const response = await openai.createChatCompletion(
      {
        ...openAIParams,
        messages: reduceMessages(
          prompts.map((message) => ({
            role: message.role,
            content: message.content,
          }))
        ),
        stream: true,
      },
      { responseType: 'stream' }
    );

    const stream = response.data as unknown as IncomingMessage;

    stream.on('data', (chunk: Buffer) => {
      // Messages in the event stream are separated by a pair of newline characters.
      const payloads = chunk.toString().split('\n\n');
      for (const payload of payloads) {
        // console.log(payload);
        if (payload.includes('[DONE]')) return;
        if (payload.startsWith('data:')) {
          const data = payload.replaceAll(/(\n)?^data:\s*/g, ''); // in case there's multiline data event
          try {
            const delta = JSON.parse(
              data.trim()
            ) as ChatCompletionStreamResponseMessage;
            res = updateMessageWithDelta(res, delta.choices[0]?.delta || {});
            // We want to update the message every 5 messages
            // to avoid spamming the DDB Client and messages may not be in order
            // TODO: Once we move to websockets, then we don't need to do this
            if (count++ % 5 === 0) {
              streamUpdate(res);
            }
          } catch (error) {
            console.log(`Error with JSON.parse and ${payload}.\n${error}`);
          }
        }
      }
    });

    stream.on('end', () => {
      console.log('Stream done');
      const response = {
        messages: [...prompts, res],
        // TODO: Calculate the usage using tiktoken or equivalent
        usage: { completionTokens: 0, promptTokens: 0, totalTokens: 0 },
      };
      resolve(response);
    });
    stream.on('error', (e: Error) => {
      console.error(e);
      reject(e.message);
    });
    return {
      usage: { completionTokens: 0, promptTokens: 0, totalTokens: 0 },
      messages: [],
    };
  });
}
