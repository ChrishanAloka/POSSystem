const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Salary = require('../models/Salary');
const authMiddleware = require('../middleware/auth');

router.get('/calculate', authMiddleware, async (req, res) => {
  try {
    const employees = await Employee.find().select('-__v');
    const month = req.query.month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // Parse the month and year to filter attendance records
    const [monthName, year] = month.split(' ');
    const monthIndex = new Date(Date.parse(`${monthName} 1, ${year}`)).getMonth();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month

    const salaries = await Promise.all(employees.map(async (employee) => {
      // Validate employee fields
      if (!employee.workingHours || !employee.salaryType) {
        return {
          employeeId: employee.employeeId,
          name: employee.name,
          month,
          entries: [],
          totalBaseSalary: 0,
          totalOtSalary: 0,
          grossSalary: 0,
          netSalary: 0,
          error: 'Missing workingHours or salaryType'
        };
      }

      // Filter attendance records for the specified month
      const attendanceRecords = await Attendance.find({
        employeeId: employee.employeeId,
        date: { $gte: startDate, $lte: endDate }
      });

      const monthlyEntries = [];
      const uniqueDates = [...new Set(attendanceRecords.map(r => new Date(r.date).toDateString()))];

      for (const date of uniqueDates) {
        const dailyRecords = attendanceRecords.filter(r => new Date(r.date).toDateString() === date);
        const inTime = dailyRecords.find(r => r.status === 'In');
        const outTime = dailyRecords.find(r => r.status === 'Out');

        if (inTime && outTime) {
          const workDurationMs = new Date(outTime.date) - new Date(inTime.date);
          const workHours = workDurationMs / (1000 * 60 * 60);
          const breakMinutes = dailyRecords.find(r => r.status === 'Break')?.breakDuration || 0;
          const netWorkHours = workHours - (breakMinutes / 60);
          const otHours = netWorkHours > employee.workingHours ? netWorkHours - employee.workingHours : 0;

          const daySalary = employee.salaryType === 'Daily' ? employee.salary : employee.salary / 30; // Assume 30 days for monthly
          const otRate = employee.salary / (employee.workingHours || 8); // OT rate per hour
          const otSalary = otHours * otRate;

          monthlyEntries.push({
            date: new Date(inTime.date),
            inTime: new Date(inTime.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            outTime: new Date(outTime.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            workingHours: employee.workingHours,
            otHours: otHours.toFixed(1),
            salaryType: employee.salaryType,
            daySalary: daySalary.toFixed(2),
            otSalary: otSalary.toFixed(2),
          });
        }
      }

      const totalBaseSalary = monthlyEntries.reduce((sum, entry) => sum + parseFloat(entry.daySalary), 0);
      const totalOtSalary = monthlyEntries.reduce((sum, entry) => sum + parseFloat(entry.otSalary), 0);
      const grossSalary = totalBaseSalary + totalOtSalary;
      const netSalary = grossSalary; // No deductions for now

      let salaryDoc = await Salary.findOne({ employeeId: employee.employeeId, month });
      if (salaryDoc) {
        salaryDoc.entries = monthlyEntries;
        salaryDoc.totalBaseSalary = totalBaseSalary;
        salaryDoc.totalOtSalary = totalOtSalary;
        salaryDoc.grossSalary = grossSalary;
        salaryDoc.netSalary = netSalary;
      } else {
        salaryDoc = new Salary({
          employeeId: employee.employeeId,
          month,
          name: employee.name,
          entries: monthlyEntries,
          totalBaseSalary,
          totalOtSalary,
          grossSalary,
          netSalary,
        });
      }
      await salaryDoc.save();
      return salaryDoc;
    }));

    res.json(salaries.filter(salary => !salary.error));
  } catch (error) {
    console.error('Salary calculation error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;