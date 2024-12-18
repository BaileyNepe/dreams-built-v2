import { env } from '@config/env';
import { logError } from '@utils/logger';
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response
} from 'express';

export const asyncHandler =
  (handler: RequestHandler): RequestHandler =>
  // eslint-disable-next-line consistent-return
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // This needs to be awaited so that the error can be caught
      await handler(req, res, next);
    } catch (error) {
      return next(error);
    }
  };

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isDefaultStatusCode =
    res.statusCode === 200 || res.statusCode === 304 || !res.statusCode;
  const statusCode =
    err.status || err.statusCode || (isDefaultStatusCode ? 500 : res.statusCode);

  logError({ error: err, message: err.message, status: statusCode });

  return res.status(statusCode).send({
    message: err.message,
    error: err.error,
    code: err.code,
    name: err.name,
    stack: env.environment === 'development' ? err.stack : undefined,
    statusCode
  });
};
