const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

router.get('/latest', async (req, res) => {
  try {
    const latest = await Invoice.findOne().sort({ invoiceNo: -1 });
    res.json({ latestNo: latest ? parseInt(latest.invoiceNo.replace('INV000', '')) : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { invoiceNo, poNo, customerName, address, jobDetails, total, quotationId, status } = req.body;
  const invoice = new Invoice({
    invoiceNo,
    poNo,
    customerName,
    address,
    jobDetails,
    total,
    quotationId,
    status,
  });
  try {
    const newInvoice = await invoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;