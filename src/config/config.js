const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
const envPath = path.resolve(process.cwd(), envFile);

if (!fs.existsSync(envPath)) {
  console.warn(`Warning: Environment file ${envPath} not found. Using default values.`);
}

dotenv.config({ path: envPath });

const requiredEnvVars = ['MONGODB_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const config = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api'
  },
  
  database: {
    url: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_TIMEOUT || '5000', 10),
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10', 10),
      minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '1', 10),
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true
    },
    replicaSet: process.env.MONGODB_REPLICA_SET,
    authSource: process.env.MONGODB_AUTH_SOURCE || 'admin'
  },
  
    jwt: {
    secret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-key'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    logToFile: process.env.LOG_TO_FILE === 'true',
    logDir: process.env.LOG_DIR || 'logs'
  }
};

if (config.server.nodeEnv === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production environment');
}

module.exports = config;
