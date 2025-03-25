const express = require('express');
const cors = require('cors');
const { configureContainer } = require('./container');
const { createRateLimiter, createStrictRateLimiter } = require('./utils/rate-limiter.middleware');
const authMiddleware = require('./utils/authMiddleware');
const createMongoSanitizer = require('./utils/mongoSanitize.middleware');

const app = express();

const container = configureContainer();
const logger = container.resolve('logger');
const appConfig = container.resolve('config');

container.resolve('subscriptionEventsSubscriber');

const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(createMongoSanitizer());

app.use(createRateLimiter(appConfig));


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

const apiPrefix = appConfig.server.apiPrefix;

app.use(apiPrefix, createStrictRateLimiter(appConfig));

const strictLimiter = createStrictRateLimiter(appConfig);
app.use(`${apiPrefix}/subscriptions/:id/cancel`, strictLimiter);
app.use(`${apiPrefix}/customers`, strictLimiter);


app.use('/api/subscriptions', authMiddleware);
app.use('/api/customers', authMiddleware);
app.use(apiPrefix, container.resolve('createSubscriptionRoute'));
app.use(apiPrefix, container.resolve('getSubscriptionRoute'));
app.use(apiPrefix, container.resolve('getCustomerSubscriptionsRoute'));
app.use(apiPrefix, container.resolve('cancelSubscriptionRoute'));
app.use(apiPrefix, container.resolve('renewSubscriptionRoute'));



app.get('/health', async (req, res) => {
  try {
    const mongoConnection = container.resolve('mongoConnection');
    const dbStatus = await mongoConnection.healthCheck();
    
    res.status(200).json({ 
      status: 'ok',
      version: process.env.npm_package_version || '1.0.0',
      environment: appConfig.server.nodeEnv,
      database: dbStatus
    });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    res.status(500).json({ 
      status: 'error',
      message: 'Health check failed',
      details: error.message
    });
  }
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status
    }
  });
});

module.exports = app;

