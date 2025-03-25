const { Router } = require('express');
const authMiddleware  = require('../../../../utils/authMiddleware');

const renewSubscriptionRoute = ({ renewSubscriptionController }) => {
  const router = Router();
  
  router.post('/subscriptions/:id/renew',
    authMiddleware,
    renewSubscriptionController.execute);
  
  return router;
};

module.exports = renewSubscriptionRoute; 