
const mongoose = require('mongoose');
const CustomerModel = require('../models/customer.model');
const SubscriptionModel = require('../models/subscription.model');

async function createMongoDBIndexes(logger) {
  try {
    logger.info('Creating MongoDB indexes...');
    
    await CustomerModel.collection.createIndex(
      { email: 1 }, 
      { unique: true, background: true }
    );
    
    await CustomerModel.collection.createIndex(
      { name: 'text', email: 'text' }, 
      { weights: { name: 2, email: 1 }, background: true }
    );
    
    await SubscriptionModel.collection.createIndex(
      { customerId: 1, status: 1 }, 
      { background: true }
    );
    
    await SubscriptionModel.collection.createIndex(
      { currentPeriodEnd: 1 }, 
      { expireAfterSeconds: 0, background: true }
    );
    
    await SubscriptionModel.collection.createIndex(
      { currentPeriodEnd: 1, status: 1 }, 
      { background: true }
    );
    
    await SubscriptionModel.collection.createIndex(
      { 'plan.id': 1, status: 1 },
      { background: true }
    );
    
    logger.info('MongoDB indexes created successfully');
  } catch (error) {
    logger.error(`Error creating MongoDB indexes: ${error.message}`);
    throw error;
  }
}

module.exports = { createMongoDBIndexes };