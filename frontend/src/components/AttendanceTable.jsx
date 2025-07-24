import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaTimes, FaCheck, FaSync } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../css/AuthForm.css';

function AttendanceTable() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://possystem-eo7h.onrender.com/api/attendance/records', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAttendanceRecords(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditRecord({ ...record });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `https://possystem-eo7h.onrender.com/api/attendance/records/${editRecord._id}`,
        {
          status: editRecord.status,
          breakDuration: editRecord.status === 'Break' ? editRecord.breakDuration : 0,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setAttendanceRecords(attendanceRecords.map((r) => (r._id === editRecord._id ? editRecord : r)));
      setEditRecord(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`https://possystem-eo7h.onrender.com/api/attendance/records/${deleteConfirm._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAttendanceRecords(attendanceRecords.filter((r) => r._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditRecord({ ...editRecord, [e.target.name]: e.target.value });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Records', 13, 10);
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
    doc.save('attendance_records.pdf');
  };

  const exportToExcel = () => {
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
    a.download = 'attendance_records.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Attendance Records</h2>
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
            onClick={fetchAttendanceRecords}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300 flex items-center disabled:opacity-50"
            title="Refresh Attendance"
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Break Duration (min)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attendanceRecords.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.employeeId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.employee?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.status === 'Break' ? record.breakDuration : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(record.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                      title="Edit Attendance"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(record)}
                      className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition duration-300 flex items-center justify-center"
                      title="Delete Attendance"
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
      {editRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Attendance</h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  id="status"
                  value={editRecord.status}
                  onChange={handleEditChange}
                  required
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                >
                  <option value="In">In</option>
                  <option value="Out">Out</option>
                  <option value="Break">Break</option>
                </select>
              </div>
              {editRecord.status === 'Break' && (
                <div>
                  <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700">Break Duration (minutes)</label>
                  <input
                    type="number"
                    name="breakDuration"
                    id="breakDuration"
                    value={editRecord.breakDuration}
                    onChange={handleEditChange}
                    min="1"
                    required
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
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
              Are you sure you want to delete the attendance for {deleteConfirm.employee?.name || 'Unknown'}?
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

export default AttendanceTable;