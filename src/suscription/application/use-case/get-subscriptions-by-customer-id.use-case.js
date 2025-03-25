class GetSubscriptionsByCustomerIdUseCase {
  constructor({ subscriptionRepository, logger }) {
    this.subscriptionRepository = subscriptionRepository;
    this.logger = logger;
  }

  async execute(customerId) {
    try {
      return await this.subscriptionRepository.findByCustomerId(customerId);
    } catch (error) {
      this.logger.error(`Error getting subscriptions by client id: ${error.message}`);
      throw error;
    }
  }
}

module.exports = GetSubscriptionsByCustomerIdUseCase; 