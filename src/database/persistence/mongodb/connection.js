const mongoose = require('mongoose');

class MongoDBConnection {
  constructor({ config, logger }) {
    this.config = config;
    this.logger = logger;
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryInterval = 5000; 
  }

  async connect() {
    if (this.isConnected) {
      return mongoose.connection;
    }

    try {
      this.logger.info('Connecting to MongoDB...');
      
      this._setupConnectionEvents();
      
      const connectionOptions = {
        ...this.config.database.options
      };
      
      if (this.config.database.replicaSet) {
        connectionOptions.replicaSet = this.config.database.replicaSet;
      }
      
      if (this.config.database.authSource) {
        connectionOptions.authSource = this.config.database.authSource;
      }
      
      await mongoose.connect(this.config.database.url, connectionOptions);
      
      this.isConnected = true;
      this.connectionRetries = 0;
      this.logger.info('Successfully connected to MongoDB');
      
      await this._setupIndexes();
      
      return mongoose.connection;
    } catch (error) {
      this.logger.error(`Error connecting to MongoDB: ${error.message}`);
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        const delay = this.retryInterval * Math.pow(2, this.connectionRetries - 1);
        this.logger.info(`Retrying connection in ${delay}ms (attempt ${this.connectionRetries}/${this.maxRetries})...`);
        
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const connection = await this.connect();
              resolve(connection);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }
      
      throw error;
    }
  }

  _setupConnectionEvents() {
    mongoose.connection.on('error', (err) => {
      this.logger.error(`MongoDB connection error: ${err}`);
      this.isConnected = false;
      
      if (this.connectionRetries < this.maxRetries) {
        this.connect().catch(error => {
          this.logger.error(`Failed to reconnect to MongoDB: ${error.message}`);
        });
      }
    });
    
    mongoose.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
      this.isConnected = false;
    });
    
    mongoose.connection.on('reconnected', () => {
      this.logger.info('MongoDB reconnected');
      this.isConnected = true;
    });
    
    process.on('SIGINT', this.disconnect.bind(this));
    process.on('SIGTERM', this.disconnect.bind(this));
  }

  async _setupIndexes() {
    const CustomerModel = require('../models/customer.model');
    const SubscriptionModel = require('../models/subscription.model');
    
    try {
      await CustomerModel.createIndexes();
      await SubscriptionModel.createIndexes();
      this.logger.info('MongoDB indexes created successfully');
    } catch (error) {
      this.logger.error(`Error creating MongoDB indexes: ${error.message}`);
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }
    
    try {
      this.logger.info('Disconnecting from MongoDB...');
      await mongoose.disconnect();
      this.isConnected = false;
      this.logger.info('Disconnected from MongoDB');
    } catch (error) {
      this.logger.error(`Error disconnecting from MongoDB: ${error.message}`);
      throw error;
    }
  }
  
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected' };
      }
      
      await mongoose.connection.db.admin().ping();
      return { 
        status: 'connected',
        dbName: mongoose.connection.db.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      };
    } catch (error) {
      this.logger.error(`MongoDB health check failed: ${error.message}`);
      return { 
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = MongoDBConnection;
