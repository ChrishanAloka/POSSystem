import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaTimes, FaCheck, FaSync } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../css/AuthForm.css';

function EmployeeDetails() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://possystem-eo7h.onrender.com/api/employee/employees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEmployees(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditEmployee({ ...employee });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `https://possystem-eo7h.onrender.com/api/employee/employees/${editEmployee._id}`,
        {
          employeeId: editEmployee.employeeId,
          name: editEmployee.name,
          phoneNumber: editEmployee.phoneNumber,
          nic: editEmployee.nic,
          salary: editEmployee.salary,
          workingHours: editEmployee.workingHours,
          salaryType: editEmployee.salaryType,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setEmployees(employees.map((e) => (e._id === editEmployee._id ? editEmployee : e)));
      setEditEmployee(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`https://possystem-eo7h.onrender.com/api/employee/employees/${deleteConfirm._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEmployees(employees.filter((e) => e._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditEmployee({ ...editEmployee, [e.target.name]: e.target.value });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Employee Details', 13, 10);
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

  const exportToExcel = () => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Employee Details</h2>
        <div className="flex space-x-4">
          <button
            onClick={exportToPDF}
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300"
            title="Export to PDF"
          >
            PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition duration-300"
            title="Export to Excel"
          >
            Excel
          </button>
          <button
            onClick={fetchEmployees}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300 flex items-center disabled:opacity-50"
            title="Refresh Employees"
          >
            <FaSync className="mr-2" /> Refresh
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 mb-4 text-center bg-red-100 p-2 rounded-md">{error}</p>}
      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="overflow-x-auto bg-white rounded-xl shadow-2xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Employee ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">NIC</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Salary</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Hours</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Salary Type</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.employeeId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.phoneNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.nic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.salary}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.workingHours}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.salaryType}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                      title="Edit Employee"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(employee)}
                      className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition duration-300 flex items-center justify-center"
                      title="Delete Employee"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Employee</h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  id="employeeId"
                  value={editEmployee.employeeId}
                  onChange={handleEditChange}
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={editEmployee.name}
                  onChange={handleEditChange}
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={editEmployee.phoneNumber}
                  onChange={handleEditChange}
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label htmlFor="nic" className="block text-sm font-medium text-gray-700">NIC</label>
                <input
                  type="text"
                  name="nic"
                  id="nic"
                  value={editEmployee.nic}
                  onChange={handleEditChange}
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary</label>
                <input
                  type="number"
                  name="salary"
                  id="salary"
                  value={editEmployee.salary}
                  onChange={handleEditChange}
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">Working Hours</label>
                <input
                  type="number"
                  name="workingHours"
                  id="workingHours"
                  value={editEmployee.workingHours}
                  onChange={handleEditChange}
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label htmlFor="salaryType" className="block text-sm font-medium text-gray-700">Salary Type</label>
                <select
                  name="salaryType"
                  id="salaryType"
                  value={editEmployee.salaryType}
                  onChange={handleEditChange}
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditEmployee(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center"
                >
                  <FaTimes className="mr-1" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center disabled:opacity-50"
                >
                  {loading ? <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div> : <FaCheck className="mr-1" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-in-out">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Confirm Delete</h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete {deleteConfirm.name}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center"
              >
                <FaTimes className="mr-1" /> Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center disabled:opacity-50"
              >
                {loading ? <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div> : <FaTrash className="mr-1" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDetails;