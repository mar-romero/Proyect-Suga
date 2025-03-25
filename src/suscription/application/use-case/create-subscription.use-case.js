const mongoose = require('mongoose');

class CreateSubscriptionUseCase {
  constructor({ subscriptionRepository, customerRepository, eventEmitter, logger }) {
    this.subscriptionRepository = subscriptionRepository;
    this.customerRepository = customerRepository;
    this.eventEmitter = eventEmitter;
    this.logger = logger;
  }

  async execute(subscriptionData) {
    try {
      const session = await mongoose.startSession();
      session.startTransaction();
      
      const customer = await this.customerRepository.findById(subscriptionData.customerId);
      if (!customer) {
        throw new Error('Client not found');
      }

      const now = new Date();
      const periodEnd = new Date();

      if (subscriptionData.plan.interval === 'month') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else if (subscriptionData.plan.interval === 'year') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const subscription = {
        ...subscriptionData,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false
      };

      await this.processPayment(subscription);

      const createdSubscription = await this.subscriptionRepository.create(subscription);

      await this.eventEmitter.emit('subscription.created', createdSubscription);

      await session.commitTransaction();
      session.endSession();

      return createdSubscription;
    } catch (error) {
      this.logger.error(`Error while creating subscription: ${error.message}`);
      throw error;
    }
  }

  async processPayment(subscription) {
    this.logger.info(`Processing payment for subscription: ${JSON.stringify(subscription.plan)}`);

    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      amount: subscription.plan.amount,
      currency: subscription.plan.currency
    };
  }
}

module.exports = CreateSubscriptionUseCase; 