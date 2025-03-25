const { createContainer, asClass, asFunction, asValue, InjectionMode } = require('awilix');
const config = require('./config/config');
const logger = require('./utils/logger');
const EventEmitter = require('events');

const MongoDBConnection = require('./database/persistence/mongodb/connection');


const MongoCustomerRepository = require('./database/persistence/mongodb/mongo-customer.repository');
const MongoSubscriptionRepository = require('./database/persistence/mongodb/mongo-subscription.repository');

const CreateSubscriptionController = require('./suscription/infrastructure/api/controllers/create-subscription.controller');
const GetSubscriptionController = require('./suscription/infrastructure/api/controllers/get-subscription.controller');
const GetCustomerSubscriptionsController = require('./suscription/infrastructure/api/controllers/get-customer-subscriptions.controller');
const CancelSubscriptionController = require('./suscription/infrastructure/api/controllers/cancel-subscription.controller');
const RenewSubscriptionController = require('./suscription/infrastructure/api/controllers/renew-subscription.controller');

const GetSubscriptionByIdUseCase = require('./suscription/application/use-case/get-subscription-by-id.use-case');
const GetSubscriptionsByCustomerIdUseCase = require('./suscription/application/use-case/get-subscriptions-by-customer-id.use-case');
const CreateSubscriptionUseCase = require('./suscription/application/use-case/create-subscription.use-case');
const CancelSubscriptionUseCase = require('./suscription/application/use-case/cancel-subscription.use-case');
const RenewSubscriptionUseCase = require('./suscription/application/use-case/renew-subscription.use-case');

const EmailService = require('./infrastructure/services/email.service');

const SubscriptionEventsSubscriber = require('./suscription/application/subscribers/subscription-events.subscriber');

const createSubscriptionRoute = require('./suscription/infrastructure/api/routes/create-subscription.route');
const getSubscriptionRoute = require('./suscription/infrastructure/api/routes/get-subscription.route');
const getCustomerSubscriptionsRoute = require('./suscription/infrastructure/api/routes/get-customer-subscriptions.route');
const cancelSubscriptionRoute = require('./suscription/infrastructure/api/routes/cancel-subscription.route');
const renewSubscriptionRoute = require('./suscription/infrastructure/api/routes/renew-subscription.route');

function configureContainer() {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY
  });

  container.register({
    config: asValue(config),
    logger: asValue(logger),
    
    mongoConnection: asClass(MongoDBConnection).singleton(),
    dbConnection: asFunction(({ mongoConnection }) => {
      return mongoConnection.connect();
    }).singleton(),
    
    eventEmitter: asValue(new EventEmitter()),

    subscriptionRepository: asClass(MongoSubscriptionRepository).singleton(),
    customerRepository: asClass(MongoCustomerRepository).singleton(),
    
    emailService: asClass(EmailService).singleton(),
    
    getSubscriptionByIdUseCase: asClass(GetSubscriptionByIdUseCase).singleton(),
    getSubscriptionsByCustomerIdUseCase: asClass(GetSubscriptionsByCustomerIdUseCase).singleton(),
    createSubscriptionUseCase: asClass(CreateSubscriptionUseCase).singleton(),
    cancelSubscriptionUseCase: asClass(CancelSubscriptionUseCase).singleton(),
    renewSubscriptionUseCase: asClass(RenewSubscriptionUseCase).singleton(),
    
    createSubscriptionController: asClass(CreateSubscriptionController).singleton(),
    getSubscriptionController: asClass(GetSubscriptionController).singleton(),
    getCustomerSubscriptionsController: asClass(GetCustomerSubscriptionsController).singleton(),
    cancelSubscriptionController: asClass(CancelSubscriptionController).singleton(),
    renewSubscriptionController: asClass(RenewSubscriptionController).singleton(),
  
    createSubscriptionRoute: asFunction(createSubscriptionRoute).singleton(),
    getSubscriptionRoute: asFunction(getSubscriptionRoute).singleton(),
    getCustomerSubscriptionsRoute: asFunction(getCustomerSubscriptionsRoute).singleton(),
    cancelSubscriptionRoute: asFunction(cancelSubscriptionRoute).singleton(),
    renewSubscriptionRoute: asFunction(renewSubscriptionRoute).singleton(),
    
    subscriptionEventsSubscriber: asClass(SubscriptionEventsSubscriber).singleton(),
  });

  return container;
}

module.exports = { configureContainer };
