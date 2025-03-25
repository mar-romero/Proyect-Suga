class RenewSubscriptionController {
  constructor({ renewSubscriptionUseCase, logger }) {
    this.renewSubscriptionUseCase = renewSubscriptionUseCase;
    this.logger = logger;
    this.execute = this.execute.bind(this);
  }

  async execute(req, res, next) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({ message: 'Subscription ID is required' });
      }
      
      this.logger.info(`Manually renewing the subscription ${id}`);
      const result = await this.renewSubscriptionUseCase.execute(id);
      
      if (!result) {
        return res.status(404).json({ 
          message: 'Subscription not found, not active or marked for cancellation' 
        });
      }
      
      return res.json({ 
        message: 'Subscription successfully renewed', 
        subscription: result 
      });
    } catch (error) {
      this.logger.error(`Error renewing subscription: ${error.message}`);
      next(error);
    }
  }
}

module.exports = RenewSubscriptionController; 