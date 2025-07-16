import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSync, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function ReportForm() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, employeesRes, attendanceRes, salariesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/auth/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('http://localhost:5000/api/employee/employees', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('http://localhost:5000/api/attendance/records', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('http://localhost:5000/api/salary/calculate?month=' + new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
      ]);
      setUsers(usersRes.data);
      setEmployees(employeesRes.data);
      setAttendanceRecords(attendanceRes.data);
      setSalaries(salariesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data for reports');
    } finally {
      setLoading(false);
    }
  };

  const exportUserDetailsPDF = () => {
    console.log('jsPDF defined:', typeof jsPDF !== 'undefined'); // Debug check
    const doc = new jsPDF();
    doc.text('User Details', 10, 10);
    autoTable(doc, {
      head: [['Username', 'Email']],
      body: users.map((user) => [user.username, user.email]),
      startY: 20,
      margin: { top: 10 },
      styles: { cellPadding: 2, fontSize: 10, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 50 } },
    });
    doc.save('user_details.pdf');
  };

  const exportUserDetailsExcel = () => {
    const csv = [
      ['Username', 'Email'],
      ...users.map((user) => [user.username, user.email]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_details.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportEmployeeDetailsPDF = () => {
    console.log('jsPDF defined:', typeof jsPDF !== 'undefined'); // Debug check
    const doc = new jsPDF();
    doc.text('Employee Details', 10, 10);
    autoTable(doc, {
      head: [['Employee ID', 'Name', 'Phone', 'NIC', 'Salary', 'Hours', 'Salary Type']],
      body: employees.map((employee) => [
        employee.employeeId,
        employee.name,
        employee.phoneNumber,
        employee.nic,
        employee.salary,
        employee.workingHours,
        employee.salaryType,
      ]),
      startY: 20,
      margin: { top: 10 },
      styles: { cellPadding: 2, fontSize: 10, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 }, 4: { cellWidth: 20 }, 5: { cellWidth: 20 }, 6: { cellWidth: 30 } },
    });
    doc.save('employee_details.pdf');
  };

  const exportEmployeeDetailsExcel = () => {
    const csv = [
      ['Employee ID', 'Name', 'Phone', 'NIC', 'Salary', 'Hours', 'Salary Type'],
      ...employees.map((employee) => [
        employee.employeeId,
        employee.name,
        employee.phoneNumber,
        employee.nic,
        employee.salary,
        employee.workingHours,
        employee.salaryType,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_details.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAttendanceDetailsPDF = () => {
    console.log('jsPDF defined:', typeof jsPDF !== 'undefined'); // Debug check
    const doc = new jsPDF();
    doc.text('Attendance Details', 10, 10);
    autoTable(doc, {
      head: [['Employee ID', 'Name', 'Status', 'Break Duration (min)', 'Timestamp']],
      body: attendanceRecords.map((record) => [
        record.employeeId,
        record.employee?.name || 'N/A',
        record.status,
        record.status === 'Break' ? String(record.breakDuration) : '-',
        new Date(record.timestamp).toLocaleString(),
      ]),
      startY: 20,
      margin: { top: 10 },
      styles: { cellPadding: 2, fontSize: 10, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 40 }, 2: { cellWidth: 30 }, 3: { cellWidth: 40 }, 4: { cellWidth: 50 } },
    });
    doc.save('attendance_details.pdf');
  };

  const exportAttendanceDetailsExcel = () => {
    const csv = [
      ['Employee ID', 'Name', 'Status', 'Break Duration (min)', 'Timestamp'],
      ...attendanceRecords.map((record) => [
        record.employeeId,
        record.employee?.name || 'N/A',
        record.status,
        record.status === 'Break' ? String(record.breakDuration) : '-',
        new Date(record.timestamp).toLocaleString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_details.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportPaymentDetailsPDF = () => {
    console.log('jsPDF defined:', typeof jsPDF !== 'undefined'); // Debug check
    const doc = new jsPDF();
    doc.text('Payment Details', 10, 10);
    autoTable(doc, {
      head: [['Name', 'Employee ID', 'Date', 'Day Salary', 'OT Salary', 'Net Salary']],
      body: salaries.flatMap((salary) => [
        [
          salary.name,
          salary.employeeId,
          new Date().toLocaleDateString(),
          salary.totalBaseSalary,
          salary.totalOtSalary.toFixed(2),
          salary.netSalary.toFixed(2),
        ],
      ]),
      startY: 20,
      margin: { top: 10 },
      styles: { cellPadding: 2, fontSize: 10, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 }, 4: { cellWidth: 30 }, 5: { cellWidth: 30 } },
    });
    doc.save('payment_details.pdf');
  };

  const exportPaymentDetailsExcel = () => {
    const csv = [
      ['Name', 'Employee ID', 'Date', 'Day Salary', 'OT Salary', 'Net Salary'],
      ...salaries.flatMap((salary) => [
        [
          salary.name,
          salary.employeeId,
          new Date().toLocaleDateString(),
          salary.totalBaseSalary,
          salary.totalOtSalary.toFixed(2),
          salary.netSalary.toFixed(2),
        ],
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment_details.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Generate Reports</h2>
      {error && <p className="text-red-500 mb-6 text-center bg-red-100 p-4 rounded-xl shadow-md">{error}</p>}
      {loading && (
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform hover:-translate-y-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">User Details Report</h3>
          <div className="flex space-x-4">
            <button
              onClick={exportUserDetailsPDF}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-lg hover:from-green-500 hover:to-green-700 transition duration-300 flex items-center justify-center"
            >
              <FaFilePdf className="mr-2" /> PDF
            </button>
            <button
              onClick={exportUserDetailsExcel}
              className="flex-1 bg-gradient-to-r from-red-400 to-red-600 text-white p-3 rounded-lg hover:from-red-500 hover:to-red-700 transition duration-300 flex items-center justify-center"
            >
              <FaFileExcel className="mr-2" /> Excel
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform hover:-translate-y-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Employee Details Report</h3>
          <div className="flex space-x-4">
            <button
              onClick={exportEmployeeDetailsPDF}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-lg hover:from-green-500 hover:to-green-700 transition duration-300 flex items-center justify-center"
            >
              <FaFilePdf className="mr-2" /> PDF
            </button>
            <button
              onClick={exportEmployeeDetailsExcel}
              className="flex-1 bg-gradient-to-r from-red-400 to-red-600 text-white p-3 rounded-lg hover:from-red-500 hover:to-red-700 transition duration-300 flex items-center justify-center"
            >
              <FaFileExcel className="mr-2" /> Excel
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform hover:-translate-y-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Attendance Details Report</h3>
          <div className="flex space-x-4">
            <button
              onClick={exportAttendanceDetailsPDF}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-lg hover:from-green-500 hover:to-green-700 transition duration-300 flex items-center justify-center"
            >
              <FaFilePdf className="mr-2" /> PDF
            </button>
            <button
              onClick={exportAttendanceDetailsExcel}
              className="flex-1 bg-gradient-to-r from-red-400 to-red-600 text-white p-3 rounded-lg hover:from-red-500 hover:to-red-700 transition duration-300 flex items-center justify-center"
            >
              <FaFileExcel className="mr-2" /> Excel
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform hover:-translate-y-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Payment Details Report</h3>
          <div className="flex space-x-4">
            <button
              onClick={exportPaymentDetailsPDF}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-600 text-white p-3 rounded-lg hover:from-green-500 hover:to-green-700 transition duration-300 flex items-center justify-center"
            >
              <FaFilePdf className="mr-2" /> PDF
            </button>
            <button
              onClick={exportPaymentDetailsExcel}
              className="flex-1 bg-gradient-to-r from-red-400 to-red-600 text-white p-3 rounded-lg hover:from-red-500 hover:to-red-700 transition duration-300 flex items-center justify-center"
            >
              <FaFileExcel className="mr-2" /> Excel
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 transform hover:-translate-y-2 col-span-1 md:col-span-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white p-3 rounded-lg hover:from-blue-500 hover:to-blue-700 transition duration-300 flex items-center justify-center disabled:opacity-50"
          >
            <FaSync className="mr-2" /> Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportForm;