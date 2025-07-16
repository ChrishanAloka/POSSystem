const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');

router.get('/', async (req, res) => {
  try {
    const summaries = await Quotation.aggregate([
      {
        $lookup: {
          from: 'invoices',
          localField: '_id',
          foreignField: 'quotationId',
          as: 'invoices'
        }
      },
      {
        $unwind: {
          path: '$invoices',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          quotationId: '$_id',
          quotationNo: 1,
          customerName: 1,
          quotationTotal: '$total',
          invoiceId: '$invoices._id',
          invoiceNo: '$invoices.invoiceNo',
          invoiceTotal: '$invoices.total'
        }
      }
    ]);
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  const { invoiceId } = req.body;

  try {
    await Quotation.findByIdAndDelete(quotationId);
    if (invoiceId) {
      await Invoice.findByIdAndDelete(invoiceId);
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;