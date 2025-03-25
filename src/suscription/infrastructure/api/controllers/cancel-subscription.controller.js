class CancelSubscriptionController {
  constructor({ cancelSubscriptionUseCase, logger }) {
    this.cancelSubscriptionUseCase = cancelSubscriptionUseCase;
    this.logger = logger;
    this.execute = this.execute.bind(this);
  }

  async execute(req, res, next) {
    try {
      const id = req.params.id;
      const { cancelAtPeriodEnd = false, cancelReason } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: 'Subscription ID is required' });
      }
      
      this.logger.info(`Canceling subscription ${id}, cancelAtPeriodEnd: ${cancelAtPeriodEnd}`);
      const result = await this.cancelSubscriptionUseCase.execute(id, cancelAtPeriodEnd, cancelReason);
      
      if (!result) {
        return res.status(404).json({ message: 'Subscription not found or already cancelled' });
      }
      
      return res.json({ 
        message: 'Subscription successfully cancelled', 
        subscription: result 
      });
    } catch (error) {
      this.logger.error(`Error canceling subscription: ${error.message}`);
      next(error);
    }
  }
}

module.exports = CancelSubscriptionController; 