/* eslint-disable import/no-extraneous-dependencies */
import { generateAccessToken } from '@middleware/auth';
import { createTRPCClient, TRPCClientError, type TRPCLink } from '@trpc/client';
import { type AnyTRPCRouter, type inferRouterError } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { type TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { type ApiRouter } from 'api';
import app from 'app';
import SuperJSON from 'superjson';
import request from 'supertest';
import { defaultUserId } from './mockData';

type App = Parameters<typeof request>[0];

interface SupertestLinkOptions {
  headers?: Record<string, string>;
  trpcPath: string;
  transformer: typeof SuperJSON;
}

export function supertestLink<TRouter extends AnyTRPCRouter>(
  a: App,
  options: SupertestLinkOptions
): TRPCLink<TRouter> {
  const { transformer } = options;
  return () =>
    ({ op }) =>
      observable((observer) => {
        const input = transformer.serialize(op.input);

        const method = op.type === 'query' ? 'get' : 'post';
        const headers = {
          accept: 'application/json',
          ...options.headers
        };
        const url =
          method === 'get'
            ? `${options.trpcPath}/${op.path}?input=${encodeURIComponent(JSON.stringify(input))}`
            : `${options.trpcPath}/${op.path}`;

        request(a)
          [method](url)
          .send(input)
          .set(headers)
          .then(async (res) => {
            const meta = { response: { json: () => res.body }, responseJSON: res.body };

            if ('error' in res.body) {
              const error = transformer.deserialize(
                res.body.error
              ) as inferRouterError<TRouter>;

              observer.error(
                TRPCClientError.from(
                  {
                    ...res.body,
                    error
                  },
                  {
                    meta
                  }
                )
              );
              return;
            }
            observer.next({
              context: meta,
              result: { data: res.body.result.data.json, type: 'data' }
            });
            observer.complete();
          })
          .catch((err) => observer.error(TRPCClientError.from(err, {})));

        return () => {};
      });
}

type Headers = {
  Authorization: string | null;
};

export const createTrpcTestClient = (headers?: Headers) =>
  createTRPCClient<ApiRouter>({
    links: [
      supertestLink(app, {
        transformer: SuperJSON,
        trpcPath: '/trpc/v1',
        // Set the default token and allow overriding
        headers: {
          // @ts-expect-error we want to be allowed to remove the token
          Authorization: `Bearer ${generateAccessToken(defaultUserId)}`,
          ...headers
        }
      })
    ]
  });

export const expectTRPCClientError = async (
  action: () => Promise<unknown>,
  expected: { code?: TRPC_ERROR_CODE_KEY; message?: RegExp | string; status?: number }
) => {
  try {
    await action();
    throw new Error('Expected action to throw a TRPCClientError, but it succeeded');
  } catch (error) {
    if (error instanceof TRPCClientError) {
      if (expected.message) {
        if (expected.message instanceof RegExp) {
          expect(error.message).toMatch(expected.message);
        } else {
          expect(error.message).toBe(expected.message);
        }
      }

      if (expected.code) {
        expect(error.data.code).toBe(expected.code);
      }

      if (expected.status) {
        expect(error.data.httpStatus).toBe(expected.status);
      }
    } else {
      throw error; // Re-throw if it's not the expected error type
    }
  }
};
