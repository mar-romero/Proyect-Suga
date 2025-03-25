class RenewSubscriptionUseCase {
  constructor({ subscriptionRepository, eventEmitter, logger }) {
    this.subscriptionRepository = subscriptionRepository;
    this.eventEmitter = eventEmitter;
    this.logger = logger;
  }

  async execute(subscriptionId) {
    try {
      const subscription = await this.subscriptionRepository.findById(subscriptionId);
      
      if (!subscription || subscription.status !== 'active') {
        throw new Error('Cannot renew: subscription not found or not active');
      }
      
      if (subscription.cancelAtPeriodEnd) {
        this.logger.info(`Subscription ${subscriptionId} marked for cancellation, will not be renewed`);
        
        const now = new Date();
        if (now >= subscription.currentPeriodEnd) {
          await this.subscriptionRepository.update(subscriptionId, {
            status: 'canceled',
            updatedAt: now
          });
          
          await this.eventEmitter.emit('subscription.ended', subscription);
        }
        
        return null;
      }
      
      const newPeriodStart = new Date(subscription.currentPeriodEnd);
      const newPeriodEnd = new Date(newPeriodStart);
      
      if (subscription.plan.interval === 'month') {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      } else if (subscription.plan.interval === 'year') {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      }
      
      const paymentResult = await this.processPayment(subscription);
      
      if (!paymentResult.success) {
        await this.subscriptionRepository.update(subscriptionId, {
          status: 'past_due',
          updatedAt: new Date()
        });
        
        await this.eventEmitter.emit('subscription.payment_failed', {
          subscription,
          paymentError: paymentResult.error
        });
        
        return null;
      }
      
      const updatedSubscription = await this.subscriptionRepository.update(subscriptionId, {
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        updatedAt: new Date()
      });
      
      await this.eventEmitter.emit('subscription.renewed', {
        subscription: updatedSubscription,
        payment: paymentResult
      });
      
      return updatedSubscription;
    } catch (error) {
      this.logger.error(`Error renewing subscription: ${error.message}`);
      throw error;
    }
  }

  async processPayment(subscription) {
    this.logger.info(`Processing payment for renewal: ${JSON.stringify(subscription.plan)}`);

    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      amount: subscription.plan.amount,
      currency: subscription.plan.currency
    };
  }
}

module.exports = RenewSubscriptionUseCase; 