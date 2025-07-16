import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function AttendanceMark() {
  const [employeeId, setEmployeeId] = useState('');
  const [employee, setEmployee] = useState(null);
  const [status, setStatus] = useState('In');
  const [breakDuration, setBreakDuration] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
    }
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://possystem-mjwb.onrender.com/api/employee/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEmployee(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employee');
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(
        'https://possystem-mjwb.onrender.com/api/attendance/mark',
        {
          employeeId,
          status,
          breakDuration: status === 'Break' ? breakDuration : 0,
          date: selectedDate.toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setEmployeeId('');
      setEmployee(null);
      setStatus('In');
      setBreakDuration(0);
      setError('Attendance marked successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg shadow-md">
        Mark Attendance
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="employeeId" className="block text-lg font-semibold text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
            {loading && (
              <p className="text-center text-blue-600 font-medium">Loading...</p>
            )}
            {error && (
              <p className={`text-center py-2 rounded-lg ${error.includes('successfully') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {error}
              </p>
            )}
            {employee && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Employee Details</h3>
                <p><strong>Name:</strong> {employee.name}</p>
                <p><strong>Phone:</strong> {employee.phoneNumber}</p>
                <p><strong>NIC:</strong> {employee.nic}</p>
                <p><strong>Salary:</strong> {employee.salary}</p>
                <p><strong>Hours:</strong> {employee.workingHours}</p>
                <p><strong>Salary Type:</strong> {employee.salaryType}</p>
              </div>
            )}
            <div>
              <label htmlFor="status" className="block text-lg font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              >
                <option value="In">In</option>
                <option value="Out">Out</option>
                <option value="Break">Break</option>
              </select>
            </div>
            {status === 'Break' && (
              <div>
                <label htmlFor="breakDuration" className="block text-lg font-semibold text-gray-700 mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  name="breakDuration"
                  id="breakDuration"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !employee || (status === 'Break' && !breakDuration)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 transition duration-300 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-t-2 border-white rounded-full animate-spin mr-2"></span>
              ) : (
                <FaCheck className="mr-2" />
              )}
              Mark Attendance
            </button>
          </form>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl shadow-lg">
          <label htmlFor="date" className="block text-lg font-semibold text-gray-700 mb-2">
            Select Date
          </label>
          <div className="relative">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceMark;