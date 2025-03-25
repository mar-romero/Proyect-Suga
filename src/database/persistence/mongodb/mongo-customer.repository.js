const BaseRepository = require('./base-repository');
const ICustomerRepository = require('../../../customer/domain/repositories/customer-repository.interface');
const Customer = require('../../../customer/domain/entities/customer');
const CustomerModel = require('../models/customer.model');

/**
 * @implements {ICustomerRepository}
 */
class MongoCustomerRepository extends BaseRepository {
  /**
   * @param {Object} dependencies 
   * @param {Object} dependencies.logger
   * @param {Object} dependencies.dbConnection 
   */
  constructor({ logger, dbConnection }) {
    super({ 
      logger, 
      dbConnection, 
      model: CustomerModel, 
      entityClass: Customer 
    });
    
    const methods = Object.getOwnPropertyNames(ICustomerRepository.prototype)
      .filter(method => method !== 'constructor');
      
    for (const method of methods) {
      if (typeof this[method] !== 'function') {
        throw new Error(`MongoCustomerRepository must implement ${method} method`);
      }
    }
  }

  /**
   * @inheritdoc
   */
  async findByEmail(email) {
    try {
      this.logger.debug(`Finding customer by email: ${email}`);
      return await this.findOne({ email });
    } catch (error) {
      this.logger.error(`Error finding customer by email: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MongoCustomerRepository;
