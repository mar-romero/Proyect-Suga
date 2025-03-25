class GetSubscriptionController {
  constructor({ getSubscriptionByIdUseCase, logger }) {
    this.getSubscriptionByIdUseCase = getSubscriptionByIdUseCase;
    this.logger = logger;
    this.execute = this.execute.bind(this);
  }

  async execute(req, res, next) {
    try {
      const id = req.params.id;
      
      const subscription = await this.getSubscriptionByIdUseCase.execute(id);
      
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      
      return res.json(subscription);
    } catch (error) {
      this.logger.error(`Error getting subscription: ${error.message}`);
      next(error);
    }
  }
}

module.exports = GetSubscriptionController; 