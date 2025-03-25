const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  street: { 
    type: String, 
    trim: true 
  },
  city: { 
    type: String, 
    trim: true 
  },
  state: { 
    type: String, 
    trim: true 
  },
  zipCode: { 
    type: String, 
    trim: true 
  },
  country: { 
    type: String, 
    trim: true 
  }
}, { _id: false });

const customerSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    index: 'text' 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    index: true 
  },
  phone: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(v) || v === '';
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: addressSchema,
  status: { 
    type: String, 
    enum: {
      values: ['active', 'inactive', 'suspended'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active',
    index: true 
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

customerSchema.statics.createIndexes = async function() {
  await this.collection.createIndex({ email: 1 }, { unique: true });
  await this.collection.createIndex({ status: 1 });
  await this.collection.createIndex({ createdAt: -1 });
  await this.collection.createIndex({ name: 'text' });
};

const CustomerModel = mongoose.model('Customer', customerSchema);
module.exports = CustomerModel;
