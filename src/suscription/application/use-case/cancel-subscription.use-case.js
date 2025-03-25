class CancelSubscriptionUseCase {
    constructor({ subscriptionRepository, eventEmitter, logger }) {
      this.subscriptionRepository = subscriptionRepository;
      this.eventEmitter = eventEmitter;
      this.logger = logger;
    }
  
    async execute(id, cancelAtPeriodEnd, reason) {
      try {
        const subscription = await this.subscriptionRepository.findById(id);
        
        if (!subscription || subscription.status === 'canceled') {
          return null;
        }
        
        const updateData = {
          status: cancelAtPeriodEnd ? 'active' : 'canceled',
          canceledAt: new Date(),
          cancelReason: reason,
          cancelAtPeriodEnd: cancelAtPeriodEnd
        };
        
        if (cancelAtPeriodEnd) {
          updateData.willCancelAt = subscription.currentPeriodEnd;
        }
        
        const updatedSubscription = await this.subscriptionRepository.update(id, updateData);
  
        await this.eventEmitter.emit('subscription.canceled', updatedSubscription);
        
        return updatedSubscription;
      } catch (error) {
        this.logger.error(`Error when unsubscribing: ${error.message}`);
        throw error;
      }
    }
  }
  
  module.exports = CancelSubscriptionUseCase;