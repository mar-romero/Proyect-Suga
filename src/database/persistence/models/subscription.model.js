const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  customerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true, 
    index: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['active', 'canceled', 'paused', 'expired'],
    index: true
  },
  plan: { 
    id: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    interval: { type: String, required: true, enum: ['month', 'year'] }
  },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { 
    type: Date, 
    required: true,
    index: true 
  },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  canceledAt: { type: Date },
  cancelReason: { type: String },
  willCancelAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  indexes: [
    { customerId: 1, status: 1 }, 
    { currentPeriodEnd: 1, status: 1 } 
  ]
});

subscriptionSchema.statics.createIndexes = async function() {
  await this.collection.createIndex({ customerId: 1 });
  await this.collection.createIndex({ status: 1 });
  await this.collection.createIndex({ currentPeriodEnd: 1 });
  await this.collection.createIndex({ customerId: 1, status: 1 });
  await this.collection.createIndex({ currentPeriodEnd: 1, status: 1 });
};

const SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);
module.exports = SubscriptionModel;
