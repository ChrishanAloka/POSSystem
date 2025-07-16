const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
    required: true,
    unique: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  workingHours: {
    type: Number,
    required: true,
  },
  salaryType: {
    type: String,
    required: true,
    enum: ['Monthly', 'Daily'],
    default: 'Monthly',
  },
});

module.exports = mongoose.model('Employee', employeeSchema);