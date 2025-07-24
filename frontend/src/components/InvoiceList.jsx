import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa'; // Import trash icon

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://possystem-eo7h.onrender.com/api/invoices');
      setInvoices(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await axios.delete(`https://possystem-eo7h.onrender.com/api/invoices/${id}`);
        setInvoices(invoices.filter(invoice => invoice._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete invoice');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Invoice List</h2>
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Invoice No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">PO No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Customer Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Total (LKR)</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.poNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString('en-GB')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{invoice.total}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(invoice._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition duration-300 flex items-center justify-center"
                    title="Delete Invoice"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InvoiceList;