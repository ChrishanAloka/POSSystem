const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const PaymentTransaction = require('../models/PaymentTransaction');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { supplierId, name, nic, address, phone } = req.body;
    const supplier = new Supplier({ supplierId, name, nic, address, phone });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { supplierId, name, nic, address, phone } = req.body;
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { supplierId, name, nic, address, phone },
      { new: true }
    );
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Updated GET payment endpoint
router.get('/:id/payment', async (req, res) => {
  try {
    console.log('Fetching payment data for supplier ID:', req.params.id);
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const supplierObjectId = new mongoose.Types.ObjectId(req.params.id); // Fixed with 'new'
    console.log('Querying products for supplierId:', supplierObjectId);

    const products = await Product.find({
      $or: [
        { supplierId: supplierObjectId },
        { supplierId: req.params.id } // Temporary fix for string IDs
      ]
    }).select('grnNo name quantity price');
    console.log('Found products:', products);

    const totalAmount = products.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseInt(product.quantity) || 0;
      if (isNaN(price) || isNaN(quantity)) {
        console.error('Invalid price or quantity in product:', product);
        return sum;
      }
      return sum + (price * quantity);
    }, 0);

    console.log('Calculated totalAmount:', totalAmount);

    // Fetch existing transactions for this supplier
    const transactions = await PaymentTransaction.find({ supplierId: supplierObjectId });
    const totalPaid = transactions.reduce((sum, trans) => sum + trans.amountPaid, 0);
    const remainingAmount = Math.max(totalAmount - totalPaid, 0);

    res.json({
      supplier: { name: supplier.name, supplierId: supplier.supplierId },
      products,
      totalAmount,
      totalPaid,
      remainingAmount,
      transactions,
    });
  } catch (error) {
    console.error('Payment endpoint error:', error.message, error.stack);
    res.status(500).json({ message: 'Internal server error. Please check server logs.' });
  }
});

// New POST payment endpoint
router.post('/:id/payment', async (req, res) => {
  try {
    const { amountPaid } = req.body;
    if (!amountPaid || amountPaid < 0) {
      return res.status(400).json({ message: 'Invalid amount paid' });
    }

    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    const supplierObjectId = new mongoose.Types.ObjectId(req.params.id);
    const products = await Product.find({ supplierId: supplierObjectId }).select('price quantity');
    const totalAmount = products.reduce((sum, product) => sum + (parseFloat(product.price) || 0) * (parseInt(product.quantity) || 0), 0);
    const transactions = await PaymentTransaction.find({ supplierId: supplierObjectId });
    const totalPaid = transactions.reduce((sum, trans) => sum + trans.amountPaid, 0);
    const remainingAmount = Math.max(totalAmount - totalPaid, 0);

    const newTransaction = new PaymentTransaction({
      supplierId: supplierObjectId,
      amountPaid,
      totalAmount,
      remainingAmount: Math.max(remainingAmount - amountPaid, 0),
    });
    await newTransaction.save();

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Payment transaction error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to process payment. Please check server logs.' });
  }
});

module.exports = router;