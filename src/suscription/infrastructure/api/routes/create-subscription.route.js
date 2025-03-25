const { Router } = require('express');
const authMiddleware = require('../../../../utils/authMiddleware');
const { validateDto } = require('../../../application/dtos/subscription.dto');
const { createSubscriptionSchema } = require('../../../application/dtos/subscription.dto');

const createSubscriptionRoute = ({ createSubscriptionController }) => {
  const router = Router();
  
  router.post('/subscriptions',
    authMiddleware,
    validateDto(createSubscriptionSchema), 
    createSubscriptionController.execute);
  
  return router;
};

module.exports = createSubscriptionRoute; 