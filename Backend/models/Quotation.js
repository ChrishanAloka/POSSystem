const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  quotationNo: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  jobScope: [{ type: String }],
  items: [{ name: String, quantity: String }],
  materialCost: { type: Number, required: true },
  laborCost: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirm', 'complete', 'reject'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quotation', quotationSchema);