const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');

router.get('/latest', async (req, res) => {
  try {
    const latest = await Quotation.findOne().sort({ quotationNo: -1 });
    res.json({ latestNo: latest ? parseInt(latest.quotationNo) : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const quotations = await Quotation.find();
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { quotationNo, customerName, address, jobScope, items, materialCost, laborCost, total } = req.body;
  const quotation = new Quotation({
    quotationNo,
    customerName,
    address,
    jobScope,
    items,
    materialCost,
    laborCost,
    total,
    status: 'pending',
  });
  try {
    const newQuotation = await quotation.save();
    res.status(201).json(newQuotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { quotationNo, customerName, address, jobScope, items, materialCost, laborCost, total, status } = req.body;
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { quotationNo, customerName, address, jobScope, items, materialCost, laborCost, total, status },
      { new: true }
    );
    res.json(updatedQuotation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Quotation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quotation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;