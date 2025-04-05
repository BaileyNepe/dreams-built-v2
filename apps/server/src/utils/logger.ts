// import { env } from '@config/env';
import chalk from 'chalk';
import winston, { format } from 'winston';

const { combine, timestamp, json } = format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' }),
    new winston.transports.File({ filename: 'logs/warn.log', level: 'warn' })

    // Optionally, add other transports like console or remote logging services here
  ]
});

// const isProduction = env.environment === 'production';

// Log to the console in non-production environments
// if (!isProduction) {
logger.add(
  new winston.transports.Console({
    format: combine(
      timestamp(),
      format.printf((info) => {
        const status = info.status ? `[${info.status}]` : '';
        const message = `${info.timestamp} [${info.level}]${status}: ${info.message} ${info.details ? JSON.stringify(info.details) : ''}`;
        switch (info.level) {
          case 'info':
            return chalk.blue(message);
          case 'warn':
            return chalk.yellow(message);
          case 'error':
            return chalk.red(message);
          default:
            return message;
        }
      })
    )
  })
);
// }

type LogObject = {
  status?: number;
  message: string;
  error?: Error | unknown;
  details?: Record<string, unknown>;
};

// Generic function to log messages
const log = ({
  level,
  message,
  status,
  error,
  details
}: LogObject & {
  level: 'error' | 'warn' | 'info' | 'success';
}) => {
  const logObject = {
    status,
    timestamp: new Date().toISOString(),
    message,
    stack: error instanceof Error ? error.stack : undefined,
    details: error ? { ...details, error } : details
  };

  logger.log(level, logObject);
};

export const logInfo = (options: LogObject) => log({ level: 'info', ...options });
export const logError = (options: LogObject) =>
  log({ level: 'error', ...options, status: options.status ?? 500 });
export const logWarning = (options: LogObject) =>
  log({ level: 'warn', ...options, status: options.status ?? 400 });
