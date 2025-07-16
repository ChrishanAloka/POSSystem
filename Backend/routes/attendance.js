const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Middleware to verify token (reuse from auth)
const authMiddleware = require('../middleware/auth');

router.post('/mark', authMiddleware, async (req, res) => {
  const { employeeId, status, breakDuration, date } = req.body;

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const attendance = new Attendance({
      employeeId,
      status,
      breakDuration: status === 'Break' ? (breakDuration || 0) : 0,
      date: new Date(date), // Use the provided date
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/records', authMiddleware, async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().select('-__v');
    const recordsWithEmployee = await Promise.all(attendanceRecords.map(async (record) => {
      const employee = await Employee.findOne({ employeeId: record.employeeId }).select('name employeeId');
      return { ...record.toObject(), employee };
    }));
    res.json(recordsWithEmployee);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/records/:id', authMiddleware, async (req, res) => {
  const { status, breakDuration, date } = req.body;

  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    attendance.status = status || attendance.status;
    attendance.breakDuration = status === 'Break' ? (breakDuration || attendance.breakDuration) : 0;
    if (date) attendance.date = new Date(date);

    await attendance.save();
    res.json({ message: 'Attendance updated', attendance });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/records/:id', authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;