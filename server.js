const app = require('./src/app');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');

const server = app.listen(config.server.port, () => {
  logger.info(`Server running on port ${config.server.port} in ${config.server.nodeEnv} mode`);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = server;