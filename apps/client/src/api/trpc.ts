import { type ApiRouter } from '@dreams-built/server';
import { createTRPCReact } from '@trpc/react-query';
export const api = createTRPCReact<ApiRouter>();
