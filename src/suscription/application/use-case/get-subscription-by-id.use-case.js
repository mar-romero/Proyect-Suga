class GetSubscriptionByIdUseCase {
  constructor({ subscriptionRepository, logger }) {
    this.subscriptionRepository = subscriptionRepository;
    this.logger = logger;
  }

  async execute(id) {
    try {
      return await this.subscriptionRepository.findById(id);
    } catch (error) {
      this.logger.error(`Error getting subscription by id: ${error.message}`);
      throw error;
    }
  }
}

module.exports = GetSubscriptionByIdUseCase; 