const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate({
      path: 'supplierId',
      select: 'name supplierId',
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: 'supplierId',
      select: 'name supplierId',
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { grnNo, name, category, quantity, price, supplierId } = req.body;
    let supplierObjectId = supplierId;
    if (supplierId) {
      if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        throw new Error('Invalid supplierId format');
      }
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) throw new Error('Supplier not found');
      supplierObjectId = supplier._id;
    }
    const product = new Product({ grnNo, name, category, quantity, price, supplierId: supplierObjectId });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { grnNo, name, category, quantity, price, supplierId } = req.body;
    let supplierObjectId = supplierId;
    if (supplierId) {
      if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        throw new Error('Invalid supplierId format');
      }
      const supplier = await Supplier.findById(supplierId);
      if (!supplier) throw new Error('Supplier not found');
      supplierObjectId = supplier._id;
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { grnNo, name, category, quantity, price, supplierId: supplierObjectId },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;