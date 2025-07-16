const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const ExpenseCategory = require('../models/ExpenseCategory');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await ExpenseCategory.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });
    const category = new ExpenseCategory({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || price == null) return res.status(400).json({ message: 'Name and price are required' });
    const expense = new Expense({ name, price, description });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { name, price, description },
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;