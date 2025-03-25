const { Router } = require('express');
const authMiddleware = require('../../../../utils/authMiddleware');
const { validateDto } = require('../../../application/dtos/subscription.dto');
const { cancelSubscriptionSchema } = require('../../../application/dtos/subscription.dto');

const cancelSubscriptionRoute = ({ cancelSubscriptionController }) => {
  const router = Router();

  router.post('/subscriptions/:id/cancel',
    authMiddleware,
    validateDto(cancelSubscriptionSchema), 
    cancelSubscriptionController.execute);
  
  return router;
};

module.exports = cancelSubscriptionRoute; 