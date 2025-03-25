class SubscriptionEventsSubscriber {
  constructor({ eventEmitter, emailService, customerRepository, logger }) {
    this.eventEmitter = eventEmitter;
    this.emailService = emailService;
    this.customerRepository = customerRepository;
    this.logger = logger;
    
    this.registerHandlers();
  }
  
  registerHandlers() {
    this.eventEmitter.on('subscription.canceled', this.handleSubscriptionCanceled.bind(this));
    
    this.logger.info('Subscription event subscribers registered');
  }
  
  async handleSubscriptionCanceled(subscription) {
    try {
      this.logger.info(`Handling cancellation event for subscription ${subscription.id}`);
      
      const customer = await this.customerRepository.findById(subscription.customerId);
      
      if (!customer) {
        this.logger.warn(`Customer not found for canceled subscription ${subscription.id}`);
        return;
      }
      
      await this.emailService.sendSubscriptionCancellationEmail(subscription, customer);
      
      this.logger.info(`Cancellation notification processed for subscription ${subscription.id}`);
    } catch (error) {
      this.logger.error(`Error processing cancellation event: ${error.message}`);
    }
  }
}

module.exports = SubscriptionEventsSubscriber;