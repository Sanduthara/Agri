const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Order Issue', 'Payment Issue', 'Product Inquiry'] 
  },
  description: { type: String, default: '' },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  farmerId: { type: String, required: true },
  attachment: { type: String, default: '' },
  reply: { type: String, default: '' },           //  added
  repliedAt: { type: Date },                      // added
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

supportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Support = mongoose.model('Support', supportSchema);

module.exports = Support;
