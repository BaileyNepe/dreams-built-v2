/* eslint-disable no-console */
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { api } from 'api/trpc';
import { env } from 'config/env';
import { type FC, type PropsWithChildren } from 'react';
import superjson from 'superjson';
import { useAuthInit } from './AuthProvider';

const cacheTime = 1000 * 60 * 90; // 90 minutes
const staleTime = 1000 * 60 * 5; // 5 minutes

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      gcTime: cacheTime,
      placeholderData: keepPreviousData,
      staleTime
    },
    mutations: {
      retry: false
    }
  }
});

export const TRPCContext: FC<PropsWithChildren> = ({ children }) => {
  const { getAccessToken } = useAuthInit();

  return (
    <api.Provider
      client={api.createClient({
        links: [
          httpBatchLink({
            transformer: superjson,
            url: `${env.serverUrl}/trpc/v1`,
            fetch(url, options) {
              return fetch(url, {
                ...options,
                credentials: 'include'
              });
            },
            async headers() {
              return { authorization: `Bearer ${await getAccessToken()}` };
            }
          })
        ]
      })}
      queryClient={queryClient}
    >
      <QueryClientProvider client={queryClient}>{<>{children}</>}</QueryClientProvider>
    </api.Provider>
  );
};
