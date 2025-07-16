const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee',
  },
  status: {
    type: String,
    required: true,
    enum: ['In', 'Out', 'Break'],
  },
  breakDuration: {
    type: Number, // In minutes
    default: 0,
  },
  date: {
    type: Date,
    required: true,
  },
  pairId: {
    type: String, // Unique ID for In/Out pair
    default: () => new mongoose.Types.ObjectId().toString(),
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);