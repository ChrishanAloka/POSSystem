const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  grnNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
});

module.exports = mongoose.model('Product', productSchema);