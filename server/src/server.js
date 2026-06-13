const createApp = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB } = require('./config/db');

async function start() {
  try {
    await connectDB();
    const app = createApp();
    const server = app.listen(env.port, () => {
      logger.info(`ApexMarket API running on http://localhost:${env.port} (${env.nodeEnv})`);
      logger.info(`API docs at http://localhost:${env.port}/api/docs`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down gracefully…`);
      server.close(() => process.exit(0));
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

start();
