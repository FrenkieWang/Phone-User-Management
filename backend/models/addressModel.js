const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  userID: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  addressType: {
    type: String,
    enum: ['home', 'shipping'],
    required: true
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: {
    type: String,
  },
  town: {
    type: String,
    required: true
  },
  countyCity: {
    type: String,
    required: true
  },
  eircode: {
    type: String,
  },
}, { collection: 'Address' });

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;