const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

function createRateLimiter(config) {
  return rateLimit({
    store: new MongoStore({
      uri: config.database.url,
      collectionName: 'rate_limits',
      expireTimeMs: 60 * 60 * 1000,
      errorHandler: console.error
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip + '_general',
    message: {
      status: 'error',
      message: 'Too many requests, please try again later'
    }
  });
}

function createStrictRateLimiter(config) {
  return rateLimit({
    store: new MongoStore({
      uri: config.database.url,
      collectionName: 'strict_rate_limits',
      expireTimeMs: 60 * 60 * 1000
    }),
    windowMs: 60 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip + '_strict',
    message: {
      status: 'error',
      message: 'Rate limit exceeded for payment operations'
    }
  });
}

module.exports = {
  createRateLimiter,
  createStrictRateLimiter
};