class CreateSubscriptionController {
  constructor({ createSubscriptionUseCase, logger }) {
    this.createSubscriptionUseCase = createSubscriptionUseCase;
    this.logger = logger;
    this.execute = this.execute.bind(this);
  }

  async execute(req, res, next) {
    try {
      const subscriptionData = req.body;
      
      this.logger.info(`Creating customer subscription: ${subscriptionData.customerId}`);
      const result = await this.createSubscriptionUseCase.execute(subscriptionData);
      
      return res.status(201).json(result);
    } catch (error) {
      this.logger.error(`Error creating subscription: ${error.message}`);
      next(error);
    }
  }
}

module.exports = CreateSubscriptionController; 