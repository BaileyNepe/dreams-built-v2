import { initialiseCache } from '@config/cache';
import { corsConfig } from '@config/cors';
import { createContext } from '@config/trpc';
import * as trpcExpress from '@trpc/server/adapters/express';
import { logError } from '@utils/logger';
import { apiRouter } from 'api';

import { v1Prefix } from '@dreams-built/shared';
import cacheApi from 'api/cache/routes';
import healthApi from 'api/health/route';
import compression from 'compression';
import cors from 'cors';
import express, { json } from 'express';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';

const app: ReturnType<typeof express> = express();

initialiseCache();

app.set('trust proxy', 1);
app.use(helmet());

app.use(json());
app.use(compression());
app.use(`${v1Prefix}/health`, cors(), healthApi);
app.use(`${v1Prefix}/clear-cache`, cors(), cacheApi);

app.use(cors(corsConfig));

app.options('*', cors());

app.use(
  '/trpc/v1',
  trpcExpress.createExpressMiddleware({
    router: apiRouter,
    createContext,
    onError({ error }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        logError({ error, message: error.message });
        // modify the error message to not leak internal details
        error.message = 'Internal Server Error';
      }
    }
  })
);

// errorhandler
app.use(errorHandler);
export default app;
