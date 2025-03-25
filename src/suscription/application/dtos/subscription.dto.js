const Joi = require('joi');

const createSubscriptionSchema = Joi.object({
  customerId: Joi.string().required(),
  plan: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).default('USD'),
    interval: Joi.string().valid('month', 'year').required()
  }).required()
});

const cancelSubscriptionSchema = Joi.object({
  cancelAtPeriodEnd: Joi.boolean().default(false),
  cancelReason: Joi.string().allow('', null)
});

const validateDto = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  createSubscriptionSchema,
  cancelSubscriptionSchema,
  validateDto
};
