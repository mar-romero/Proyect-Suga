const mongoose = require('mongoose');
const config = require('./config/config');

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.database.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Successfully connected to MongoDB!');
    
    const CustomerModel = require('./database/persistence/models/customer.model');
    const newCustomer = new CustomerModel({
      name: 'Cliente de Prueba',
      email: 'test@example.com',
      phone: '123-456-7890',
      address: {
        street: 'Calle de Prueba',
        city: 'Ciudad de Prueba',
        state: 'Estado',
        zipCode: '12345',
        country: 'País'
      }
    });
    
   const savedCustomer = await newCustomer.save();
   console.log('Cliente creado con éxito:', savedCustomer);
    
    const SubscriptionModel = require('./database/persistence/models/subscription.model');
   const newSubscription = new SubscriptionModel({
     customerId: savedCustomer._id,
     status: 'active',
     plan: {
       id: 'plan-basic',
       name: 'Plan Básico',
       amount: 9.99,
       currency: 'USD',
       interval: 'month'
     },
     currentPeriodStart: new Date(),
     currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
   });
    
    const savedSubscription = await newSubscription.save();
    console.log('Suscripción creada con éxito:', savedSubscription);
    
    const allCustomers = await CustomerModel.find();
    console.log('Todos los clientes:', allCustomers);
    
    const allSubscriptions = await SubscriptionModel.find();
    console.log('Todas las suscripciones:', allSubscriptions);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testConnection();
