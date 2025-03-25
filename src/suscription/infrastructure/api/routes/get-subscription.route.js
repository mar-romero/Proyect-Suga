const { Router } = require('express');
const authMiddleware = require('../../../../utils/authMiddleware');


const getSubscriptionRoute = ({ getSubscriptionController }) => {
  const router = Router();

  router.get('/subscriptions/:id',
    authMiddleware,
    getSubscriptionController.execute);
  
  return router;
};

module.exports = getSubscriptionRoute; 