import { TRPCError } from '@trpc/server';
import { logError } from '@utils/logger';

type XeroErrorLike = {
  response?: {
    statusCode?: number;
    status?: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
  body?: unknown;
  message?: string;
};

const extractValidationMessages = (body: unknown): string => {
  if (!body || typeof body !== 'object') return '';

  const record = body as Record<string, unknown>;
  const messages: string[] = [];

  if (typeof record.Detail === 'string') messages.push(record.Detail);
  if (typeof record.detail === 'string') messages.push(record.detail);
  if (typeof record.Message === 'string') messages.push(record.Message);
  if (typeof record.message === 'string') messages.push(record.message);

  const problem = record.problem as Record<string, unknown> | undefined;
  if (problem && typeof problem.detail === 'string') messages.push(problem.detail);

  const elements = (record.Elements ?? record.elements) as
    | Array<Record<string, unknown>>
    | undefined;

  if (Array.isArray(elements)) {
    for (const element of elements) {
      const validationErrors = (element.ValidationErrors ?? element.validationErrors) as
        | Array<Record<string, unknown>>
        | undefined;

      if (Array.isArray(validationErrors)) {
        for (const validationError of validationErrors) {
          const message = validationError.Message ?? validationError.message;
          if (typeof message === 'string') messages.push(message);
        }
      }
    }
  }

  return messages.join(', ');
};

export const mapXeroError = (error: unknown): TRPCError => {
  if (error instanceof TRPCError) return error;

  const xeroError = error as XeroErrorLike;
  const status = xeroError.response?.statusCode ?? xeroError.response?.status;
  const body = xeroError.response?.body ?? xeroError.body;

  if (status === 401) {
    return new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'Xero rejected the request (unauthorised). Reconnect Xero in Settings.'
    });
  }

  if (status === 403) {
    return new TRPCError({
      code: 'PRECONDITION_FAILED',
      message:
        'Xero rejected the request (forbidden). The connection may be missing a required scope — reconnect Xero in Settings.'
    });
  }

  if (status === 404) {
    return new TRPCError({
      code: 'NOT_FOUND',
      message: 'The requested record was not found in Xero.'
    });
  }

  if (status === 429) {
    const retryAfter = xeroError.response?.headers?.['retry-after'];

    return new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Xero rate limit reached. Try again ${
        retryAfter ? `in ${retryAfter} seconds` : 'shortly'
      }.`
    });
  }

  if (status === 400) {
    const detail = extractValidationMessages(body);

    return new TRPCError({
      code: 'BAD_REQUEST',
      message: detail ? `Xero rejected the request: ${detail}` : 'Xero rejected the request.'
    });
  }

  logError({ message: 'Unexpected Xero API error', error, details: { status } });

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred while talking to Xero.'
  });
};
