import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSync, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import '../css/SalaryManagement.css';

function SalaryManagement() {
  const [salaries, setSalaries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalaries();
  }, [selectedMonth]);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://possystem-mjwb.onrender.com/api/salary/calculate?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSalaries(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch salaries');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Salary Details - ${selectedMonth}`, 13, 10);
    autoTable(doc, {
      head: [['Name', 'Employee ID', 'Date', 'In', 'Out', 'Working Hours', 'OT', 'Salary Type', 'Day Salary', 'OT Salary']],
      body: salaries.flatMap((salary) =>
        salary.entries.map((entry) => [
          salary.name,
          salary.employeeId,
          new Date(entry.date).toLocaleDateString(),
          entry.inTime || 'Off',
          entry.outTime || 'Off',
          entry.workingHours,
          entry.otHours,
          entry.salaryType,
          entry.daySalary || 0,
          entry.otSalary || 0,
        ])
      ),
      startY: 20,
      margin: { top: 10 },
      styles: { cellPadding: 2, fontSize: 8, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 },
      },
    });
    // Add totals for all employees
    autoTable(doc, {
      body: [
        ['Totals', '', '', 
         salaries.reduce((sum, salary) => sum + salary.entries.reduce((s, e) => s + (e.workingHours ? parseFloat(e.workingHours) : 0), 0), 0).toFixed(1),
         salaries.reduce((sum, salary) => sum + salary.entries.reduce((s, e) => s + (e.otHours ? parseFloat(e.otHours) : 0), 0), 0).toFixed(1),
         '', 
         salaries.reduce((sum, salary) => sum + salary.totalBaseSalary, 0).toFixed(2),
         salaries.reduce((sum, salary) => sum + salary.totalOtSalary, 0).toFixed(2),
        ],
        ['', '', '', '', '', 'Day Salary Total:', '', salaries.reduce((sum, salary) => sum + salary.totalBaseSalary, 0).toFixed(2)],
        ['', '', '', '', '', 'Gross Salary:', '', salaries.reduce((sum, salary) => sum + salary.grossSalary, 0).toFixed(2)],
        ['', '', '', '', '', 'Net Salary:', '', salaries.reduce((sum, salary) => sum + salary.netSalary, 0).toFixed(2)],
      ],
      startY: doc.lastAutoTable.finalY + 10,
      styles: { cellPadding: 2, fontSize: 8, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20 },
        9: { cellWidth: 20 },
      },
    });
    doc.save('salary_details.pdf');
  };

  const exportEmployeePDF = (salary) => {
    const doc = new jsPDF();
    doc.text(`Salary Details for ${salary.name} (${salary.employeeId}) - ${selectedMonth}`, 13, 10);
    autoTable(doc, {
      head: [['Date', 'In', 'Out', 'Working Hours', 'OT', 'Salary Type', 'Day Salary', 'OT Salary']],
      body: salary.entries.map((entry) => [
        new Date(entry.date).toLocaleDateString(),
        entry.inTime || 'Off',
        entry.outTime || 'Off',
        entry.workingHours,
        entry.otHours,
        entry.salaryType,
        entry.daySalary || 0,
        entry.otSalary || 0,
      ]),
      startY: 20,
      margin: { top: 10 },
      styles: { cellPadding: 2, fontSize: 8, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
      },
    });
    // Add totals
    autoTable(doc, {
      body: [
        ['Totals', '', '', 
         salary.entries.reduce((sum, e) => sum + (e.workingHours ? parseFloat(e.workingHours) : 0), 0).toFixed(1),
         salary.entries.reduce((sum, e) => sum + (e.otHours ? parseFloat(e.otHours) : 0), 0).toFixed(1),
         '', 
         salary.totalBaseSalary.toFixed(2),
         salary.totalOtSalary.toFixed(2)
        ],
        ['', '', '', '', '', 'Day Salary Total:', '', salary.totalBaseSalary.toFixed(2)],
        ['', '', '', '', '', 'Gross Salary:', '', salary.grossSalary.toFixed(2)],
        ['', '', '', '', '', 'Net Salary:', '', salary.netSalary.toFixed(2)],
      ],
      startY: doc.lastAutoTable.finalY + 10,
      styles: { cellPadding: 2, fontSize: 8, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
      },
    });
    doc.save(`salary_details_${salary.employeeId}_${selectedMonth.replace(' ', '_')}.pdf`);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      ...salaries.flatMap((salary) =>
        salary.entries.map((entry) => ({
          'Name': salary.name,
          'Employee ID': salary.employeeId,
          'Date': new Date(entry.date).toLocaleDateString(),
          'In': entry.inTime || 'Off',
          'Out': entry.outTime || 'Off',
          'Working Hours': entry.workingHours,
          'OT': entry.otHours,
          'Salary Type': entry.salaryType,
          'Day Salary': entry.daySalary || 0,
          'OT Salary': entry.otSalary || 0,
        }))
      ),
      // Add totals row
      {
        'Name': 'Totals',
        'Employee ID': '',
        'Date': '',
        'In': '',
        'Out': '',
        'Working Hours': salaries.reduce((sum, salary) => sum + salary.entries.reduce((s, e) => s + (e.workingHours ? parseFloat(e.workingHours) : 0), 0), 0).toFixed(1),
        'OT': salaries.reduce((sum, salary) => sum + salary.entries.reduce((s, e) => s + (e.otHours ? parseFloat(e.otHours) : 0), 0), 0).toFixed(1),
        'Salary Type': '',
        'Day Salary': salaries.reduce((sum, salary) => sum + salary.totalBaseSalary, 0).toFixed(2),
        'OT Salary': salaries.reduce((sum, salary) => sum + salary.totalOtSalary, 0).toFixed(2),
        'Day Salary Total': salaries.reduce((sum, salary) => sum + salary.totalBaseSalary, 0).toFixed(2),
        'Gross Salary': salaries.reduce((sum, salary) => sum + salary.grossSalary, 0).toFixed(2),
        'Net Salary': salaries.reduce((sum, salary) => sum + salary.netSalary, 0).toFixed(2),
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salary Details');
    XLSX.writeFile(wb, 'salary_details.xlsx');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Salary Tables</h2>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="January 2025">January 2025</option>
          <option value="February 2025">February 2025</option>
          <option value="March 2025">March 2025</option>
          <option value="April 2025">April 2025</option>
          <option value="May 2025">May 2025</option>
          <option value="June 2025">June 2025</option>
          <option value="July 2025">July 2025</option>
          <option value="August 2025">August 2025</option>
          <option value="September 2025">September 2025</option>
          <option value="October 2025">October 2025</option>
          <option value="November 2025">November 2025</option>
          <option value="December 2025">December 2025</option>
        </select>
        <button
          onClick={fetchSalaries}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Calculate Salaries
        </button>
      </div>
      <div className="flex justify-end mb-6 space-x-4">
        <button
          onClick={exportToPDF}
          className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300 flex items-center"
          title="Export All to PDF"
        >
          <FaFilePdf className="mr-2" /> All PDF
        </button>
        <button
          onClick={exportToExcel}
          className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition duration-300 flex items-center"
          title="Export to Excel"
        >
          Excel
        </button>
        <button
          onClick={fetchSalaries}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300 flex items-center disabled:opacity-50"
          title="Refresh Salaries"
        >
          <FaSync className="mr-2" /> Refresh
        </button>
      </div>
      {error && <p className="text-red-500 mb-4 text-center bg-red-100 p-2 rounded-md">{error}</p>}
      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {salaries.length === 0 && !loading && !error && (
        <p className="text-center text-gray-600">No salary data available for {selectedMonth}</p>
      )}
      {salaries.map((salary) => (
        <div key={salary._id} className="mb-8 bg-white rounded-xl shadow-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">
              {salary.name} (Employee ID: {salary.employeeId})
            </h3>
            <button
              onClick={() => exportEmployeePDF(salary)}
              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300 flex items-center"
              title="Download Employee PDF"
            >
              <FaFilePdf className="mr-2" /> Download PDF
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">In</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Out</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Working Hours</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">OT</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Salary Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Day Salary</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">OT Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salary.entries.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.inTime || 'Off'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.outTime || 'Off'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.workingHours}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.otHours}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.salaryType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.daySalary || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{entry.otSalary || 0}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-right">Totals:</td>
                  <td className="px-6 py-4">{salary.entries.reduce((sum, e) => sum + (e.workingHours ? parseFloat(e.workingHours) : 0), 0).toFixed(1)}</td>
                  <td className="px-6 py-4">{salary.entries.reduce((sum, e) => sum + (e.otHours ? parseFloat(e.otHours) : 0), 0).toFixed(1)}</td>
                  <td></td>
                  <td className="px-6 py-4">{salary.totalBaseSalary.toFixed(2)}</td>
                  <td className="px-6 py-4">{salary.totalOtSalary.toFixed(2)}</td>
                </tr>
                <tr className="bg-blue-100">
                  <td colSpan="5" className="px-6 py-4 text-right font-bold">Day Salary Total:</td>
                  <td colSpan="3" className="px-6 py-4 bg-blue-200">{salary.totalBaseSalary.toFixed(2)}</td>
                </tr>
                <tr className="bg-blue-100">
                  <td colSpan="5" className="px-6 py-4 text-right font-bold">Gross Salary:</td>
                  <td colSpan="3" className="px-6 py-4 bg-blue-200">{salary.grossSalary.toFixed(2)}</td>
                </tr>
                <tr className="bg-blue-100">
                  <td colSpan="5" className="px-6 py-4 text-right font-bold">Net Salary:</td>
                  <td colSpan="3" className="px-6 py-4 bg-yellow-200">{salary.netSalary.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SalaryManagement;