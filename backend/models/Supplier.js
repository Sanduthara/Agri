// models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplier: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  collectedAmount: { type: Number, default: 0 }, // Total material collected (kg, tons)
  deliveryCount: { type: Number, default: 0 }, // Number of deliveries made
  qualityRating: { type: Number, min: 0, max: 5, default: 3 }, // Rating (1-5 stars)
  lastDeliveryDate: { type: Date }, // Track the last delivery date for reports
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
