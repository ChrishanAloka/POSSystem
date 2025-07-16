const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  amountPaid: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: true, min: 0 },
  remainingAmount: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);