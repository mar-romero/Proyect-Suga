const BaseRepository = require('./base-repository');
const ISubscriptionRepository = require('../../../suscription/domain/interfaces/subscription-repository.interface');
const Subscription = require('../../../suscription/domain/entities/subscription');
const SubscriptionModel = require('../models/subscription.model');

/**
 * @implements {ISubscriptionRepository}
 */
class MongoSubscriptionRepository extends BaseRepository {
  /**
   * @param {Object} dependencies 
   * @param {Object} dependencies.logger 
   * @param {Object} dependencies.dbConnection
   */
  constructor({ logger, dbConnection }) {
    super({ 
      logger, 
      dbConnection, 
      model: SubscriptionModel, 
      entityClass: Subscription 
    });
    
    const methods = Object.getOwnPropertyNames(ISubscriptionRepository.prototype)
      .filter(method => method !== 'constructor');
      
    for (const method of methods) {
      if (typeof this[method] !== 'function') {
        this.logger.warn(`Method ${method} from ISubscriptionRepository not implemented in MongoSubscriptionRepository`);
      }
    }
  }

  /**
   * @inheritdoc
   */
  async findByCustomerId(customerId) {
    try {
      this.logger.debug(`Finding subscriptions for customer: ${customerId}`);
      const docs = await this.model.find({ customerId });
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      this.logger.error(`Error finding subscriptions by customerId: ${error.message}`);
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  async findByStatus(status) {
    try {
      this.logger.debug(`Finding subscriptions with status: ${status}`);
      const docs = await this.model.find({ status });
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      this.logger.error(`Error finding subscriptions by status: ${error.message}`);
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  async findExpiringBetweenDates(startDate, endDate) {
    try {
      this.logger.debug(`Finding subscriptions expiring between ${startDate} and ${endDate}`);
      const docs = await this.model.find({
        currentPeriodEnd: {
          $gte: startDate,
          $lte: endDate
        }
      });
      return docs.map(doc => this._mapToEntity(doc));
    } catch (error) {
      this.logger.error(`Error finding expiring subscriptions: ${error.message}`);
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  async getSubscriptionStatsByPlan() {
    try {
      this.logger.info('Getting subscription stats by plan');
      
      const stats = await this.model.aggregate([
        {
          $group: {
            _id: {
              planId: '$plan.id',
              planName: '$plan.name',
              interval: '$plan.interval'
            },
            count: { $sum: 1 },
            activeCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            },
            canceledCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0]
              }
            },
            totalRevenue: {
              $sum: '$plan.amount'
            },
            avgLifetime: {
              $avg: {
                $divide: [
                  { $subtract: ['$currentPeriodEnd', '$createdAt'] },
                  1000 * 60 * 60 * 24 
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            planId: '$_id.planId',
            planName: '$_id.planName',
            interval: '$_id.interval',
            count: 1,
            activeCount: 1,
            canceledCount: 1,
            totalRevenue: { $round: ['$totalRevenue', 2] },
            avgLifetimeDays: { $round: ['$avgLifetime', 1] }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      return stats;
    } catch (error) {
      this.logger.error(`Error getting subscription stats: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MongoSubscriptionRepository;
