import { ApiHandler } from 'sst/node/api';
import { useSession } from 'sst/node/future/auth';
import { ValidationException } from '../errors/index.js';

declare module 'sst/node/future/auth' {
  export interface SessionTypes {
    user: {
      /** The user's id */
      userId: string;
      /** The organization id the user belongs to */
      organizationId: string;
      /** The user's name */
      name?: string;
      /** A url to an image to be displayed as the avatar */
      avatarUrl?: string;
    };
  }
}

export type Handler<TBody, TPathParameters, TResponse> = (params: {
  body: TBody;
  pathParameters: TPathParameters;
  actorId: string;
}) => Promise<{
  statusCode?: number;
  message: string;
  data?: TResponse;
}>;

export const AuthenticatedApiHandler = <
  TBody = any,
  TPathParameters = any,
  TResponse = any
>(
  handler: Handler<TBody, TPathParameters, TResponse>
) => {
  return ApiHandler(async ({ body, pathParameters }) => {
    const session = useSession();

    if (session.type !== 'user') {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Please authenticate before continuing.',
        }),
      };
    }

    const parsedBody: TBody = body ? JSON.parse(body) : {};

    try {
      const result = await handler({
        body: parsedBody,
        pathParameters: pathParameters as TPathParameters,
        actorId: session.properties.userId,
      });

      return {
        statusCode: result.statusCode || 200,
        body: JSON.stringify({
          message: result.message,
          data: result.data,
        }),
      };
    } catch (error) {
      console.error(error);
      const message = (error as Error)?.message || 'Something went wrong';
      const statusCode = (error as ValidationException)?.statusCode || 500;
      return {
        statusCode,
        body: JSON.stringify({ message }),
      };
    }
  });
};

export const PublicApiHandler = <
  TBody = any,
  TPathParameters = any,
  TResponse = any
>(
  handler: Handler<TBody, TPathParameters, TResponse>
) => {
  return ApiHandler(async ({ body, pathParameters }) => {
    const session = useSession();

    const parsedBody: TBody = body ? JSON.parse(body) : {};

    try {
      const result = await handler({
        body: parsedBody,
        pathParameters: pathParameters as TPathParameters,
        actorId: session.type === 'user' ? session.properties.userId : 'public',
      });

      return {
        statusCode: result.statusCode || 200,
        body: JSON.stringify({
          message: result.message,
          data: result.data,
        }),
      };
    } catch (error) {
      console.error(error);
      const message = (error as Error)?.message || 'Something went wrong';
      const statusCode = (error as ValidationException)?.statusCode || 500;
      return {
        statusCode,
        body: JSON.stringify({ message }),
      };
    }
  });
};
