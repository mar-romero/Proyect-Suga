class GetCustomerSubscriptionsController {
  constructor({ getSubscriptionsByCustomerIdUseCase, logger }) {
    this.getSubscriptionsByCustomerIdUseCase = getSubscriptionsByCustomerIdUseCase;
    this.logger = logger;
    this.execute = this.execute.bind(this);
  }

  async execute(req, res, next) {
    try {
      const customerId = req.params.customerId;
      
      const subscriptions = await this.getSubscriptionsByCustomerIdUseCase.execute(customerId);
      
      return res.json(subscriptions);
    } catch (error) {
      this.logger.error(`Error getting client subscriptions: ${error.message}`);
      next(error);
    }
  }
}

module.exports = GetCustomerSubscriptionsController; 