import { initialiseWebSocket } from '@config/ws/ws';
import { logError, logInfo } from '@utils/logger';
import { createServer } from 'http';
import app from './app';
import { env } from './config/env';

const port = env.expressPort || 5000;

const server = createServer(app);

initialiseWebSocket(server);
server
  .listen(port, async () => {
    logInfo({ message: `Server has started on port ${port}` });
  })
  .on('error', (err) => {
    logError({ message: 'Error starting server', error: err });
  });
