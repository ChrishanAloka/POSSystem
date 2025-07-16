const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee',
  },
  month: {
    type: String,
    required: true, // e.g., "May 2025"
  },
  name: {
    type: String,
    required: true,
  },
  entries: [
    {
      date: {
        type: Date,
        required: true,
      },
      inTime: {
        type: String, // e.g., "8:00 AM"
      },
      outTime: {
        type: String, // e.g., "5:00 PM"
      },
      workingHours: {
        type: Number,
        default: 0,
      },
      otHours: {
        type: Number,
        default: 0,
      },
      salaryType: {
        type: String,
        default: 'Monthly',
      },
      daySalary: {
        type: Number,
        default: 0,
      },
      otSalary: {
        type: Number,
        default: 0,
      },
    },
  ],
  totalBaseSalary: {
    type: Number,
    default: 0,
  },
  totalOtSalary: {
    type: Number,
    default: 0,
  },
  grossSalary: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Salary', salarySchema);