const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phoneSchema = new Schema({
  manufacturer: { 
    type: String,
    required: true
  },
  model: { 
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { collection: 'Phone' });

phoneSchema.pre('save', function(next) {
  Phone.countDocuments()
    .then(count => count >= 10 ? next(new Error('Phone items 10 maximum.')) : next())
    .catch(error => next(error)); // Error in saving into Documents
});

const Phone = mongoose.model('Phone', phoneSchema);
module.exports = Phone;