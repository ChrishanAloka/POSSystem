const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  poNo: { type: String, required: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  jobDetails: [
    {
      no: Number,
      description: String,
      qty: String,
      amount: Number,
    },
  ],
  total: { type: Number, required: true },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invoice', invoiceSchema);