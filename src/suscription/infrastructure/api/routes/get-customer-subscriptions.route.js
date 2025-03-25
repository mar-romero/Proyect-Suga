const { Router } = require('express');
const authMiddleware = require('../../../../utils/authMiddleware');


const getCustomerSubscriptionsRoute = ({ getCustomerSubscriptionsController }) => {
  const router = Router();
  
  router.get('/customers/:customerId/subscriptions',
    authMiddleware,
    getCustomerSubscriptionsController.execute);
  
  return router;
};

module.exports = getCustomerSubscriptionsRoute; 