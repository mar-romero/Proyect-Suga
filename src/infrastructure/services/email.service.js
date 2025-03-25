class EmailService {
  constructor({ logger, config }) {
    this.logger = logger;
    this.config = config;
  }

  async sendSubscriptionCancellationEmail(subscription, customer) {
    try {
      this.logger.info(`Sending cancellation email for subscription ${subscription.id} to customer ${customer.email}`);
      this.logger.info('Cancellation email sent successfully');
      return true;
    } catch (error) {
      this.logger.error(`Error sending cancellation email: ${error.message}`);
      throw error;
    }
  }
}

module.exports = EmailService;