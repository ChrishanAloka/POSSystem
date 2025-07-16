const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const authMiddleware = require('../middleware/auth');

router.post('/register', authMiddleware, async (req, res) => {
  const { employeeId, name, phoneNumber, nic, salary, workingHours, salaryType } = req.body;

  try {
    let employee = await Employee.findOne({ employeeId });
    if (employee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    employee = new Employee({
      employeeId,
      name,
      phoneNumber,
      nic,
      salary,
      workingHours,
      salaryType: salaryType || 'Monthly',
    });

    await employee.save();
    res.status(201).json({ message: 'Employee registered successfully', employee });
  } catch (error) {
    console.error('Employee registration error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/employees', authMiddleware, async (req, res) => {
  try {
    const employees = await Employee.find().select('-__v');
    res.json(employees);
  } catch (error) {
    console.error('Fetch employees error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/employees/:employeeId', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.params.employeeId }).select('-__v');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Fetch employee error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/employees/:id', authMiddleware, async (req, res) => {
  const { employeeId, name, phoneNumber, nic, salary, workingHours, salaryType } = req.body;

  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employeeId && employeeId !== employee.employeeId) {
      const existingEmployee = await Employee.findOne({ employeeId });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
      employee.employeeId = employeeId;
    }

    if (nic && nic !== employee.nic) {
      const existingEmployee = await Employee.findOne({ nic });
      if (existingEmployee) {
        return res.status(400).json({ message: 'NIC already exists' });
      }
      employee.nic = nic;
    }

    employee.name = name || employee.name;
    employee.phoneNumber = phoneNumber || employee.phoneNumber;
    employee.salary = salary || employee.salary;
    employee.workingHours = workingHours || employee.workingHours;
    employee.salaryType = salaryType || employee.salaryType;

    await employee.save();
    res.json({ message: 'Employee updated', employee });
  } catch (error) {
    console.error('Update employee error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/employees/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    console.error('Delete employee error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;