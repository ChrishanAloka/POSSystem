import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function ConfirmationDetails() {
  const [confirmedQuotations, setConfirmedQuotations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editQuotation, setEditQuotation] = useState(null);
  const [paymentData, setPaymentData] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchConfirmedQuotations();
  }, []);

  const fetchConfirmedQuotations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://possystem-eo7h.onrender.com/api/quotations');
      setConfirmedQuotations(res.data.filter(q => q.status === 'confirm'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch confirmed quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quotation) => {
    setEditQuotation(quotation);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { _id, quotationNo, customerName, address, phone, jobScope, items, materialCost, laborCost, total } = editQuotation;
      await axios.put(`https://possystem-eo7h.onrender.com/api/quotations/${_id}`, {
        quotationNo,
        customerName,
        address,
        phone,
        jobScope,
        items,
        materialCost,
        laborCost,
        total,
      });
      setConfirmedQuotations(confirmedQuotations.map(q => q._id === _id ? { ...editQuotation } : q));
      setEditQuotation(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quotation');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditQuotation({ ...editQuotation, [name]: value });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await axios.delete(`https://possystem-eo7h.onrender.com/api/quotations/${id}`);
        setConfirmedQuotations(confirmedQuotations.filter(q => q._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete quotation');
      }
    }
  };

  const handlePaymentSubmit = async (quotationId) => {
    const amountPaid = parseFloat(paymentData[quotationId]) || 0;
    const quotation = confirmedQuotations.find(q => q._id === quotationId);
    const total = parseFloat(quotation.total) || 0;
    const remaining = total - amountPaid;

    try {
      if (remaining <= 0) {
        await axios.put(`https://possystem-eo7h.onrender.com/api/quotations/${quotationId}`, { status: 'complete' });
        setConfirmedQuotations(confirmedQuotations.map(q => q._id === quotationId ? { ...q, status: 'complete' } : q));
      }
      alert(`Remaining Amount: LKR ${remaining.toFixed(2)} ${remaining <= 0 ? ' - Payment Complete' : ''}`);
      setPaymentData({ ...paymentData, [quotationId]: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Confirmation Details', 13, 10);
    autoTable(doc, {
      head: [['Quotation No', 'Customer Name', 'Total (LKR)', 'Date', 'Status']],
      body: confirmedQuotations.map((quotation) => [
        quotation.quotationNo,
        quotation.customerName,
        quotation.total,
        new Date(quotation.createdAt).toLocaleDateString('en-GB'),
        quotation.status,
      ]),
      startY: 20,
      margin: { top: 10 },
      styles: { cellPadding: 2, fontSize: 10, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 50 }, 2: { cellWidth: 30 }, 3: { cellWidth: 40 }, 4: { cellWidth: 30 } },
    });
    doc.save('confirmation_details.pdf');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Confirmation Details</h2>
        <button
          onClick={exportToPDF}
          className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300"
          title="Export to PDF"
        >
          PDF
        </button>
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Quotation No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Customer Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Total (LKR)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {confirmedQuotations.map((quotation) => (
              <tr key={quotation._id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quotation.quotationNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quotation.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quotation.total}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(quotation.createdAt).toLocaleDateString('en-GB')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{quotation.status}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(quotation)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                      title="Edit Quotation"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(quotation._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition duration-300 flex items-center justify-center"
                      title="Delete Quotation"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total: LKR {quotation.total}</p>
                      <input
                        type="number"
                        value={paymentData[quotation._id] || ''}
                        onChange={(e) => setPaymentData({ ...paymentData, [quotation._id]: e.target.value })}
                        placeholder="Amount Paid"
                        className="mt-1 w-full p-2 border rounded"
                      />
                      <button
                        onClick={() => handlePaymentSubmit(quotation._id)}
                        className="bg-green-500 text-white px-3 py-1 mt-1 rounded-full hover:bg-green-600 transition duration-300 flex items-center justify-center"
                        title="Submit Payment"
                      >
                        <FaCheck className="mr-1" /> Pay
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl transform transition-all duration-300 ease-in-out">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Quotation</h3>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <div>
                    <label htmlFor="quotationNo" className="block text-sm font-medium text-gray-700">Quotation No</label>
                    <input
                      type="text"
                      name="quotationNo"
                      id="quotationNo"
                      value={editQuotation.quotationNo}
                      onChange={handleEditChange}
                      required
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <input
                      type="text"
                      name="customerName"
                      id="customerName"
                      value={editQuotation.customerName}
                      onChange={handleEditChange}
                      required
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={editQuotation.address}
                      onChange={handleEditChange}
                      required
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={editQuotation.phone}
                      onChange={handleEditChange}
                      required
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                </div>
                {/* Right Column */}
                <div>
                  <div>
                    <label htmlFor="materialCost" className="block text-sm font-medium text-gray-700">Material Cost</label>
                    <input
                      type="number"
                      name="materialCost"
                      id="materialCost"
                      value={editQuotation.materialCost}
                      onChange={handleEditChange}
                      required
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="laborCost" className="block text-sm font-medium text-gray-700">Labor Cost</label>
                    <input
                      type="number"
                      name="laborCost"
                      id="laborCost"
                      value={editQuotation.laborCost}
                      onChange={handleEditChange}
                      required
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="total" className="block text-sm font-medium text-gray-700">Total</label>
                    <input
                      type="number"
                      name="total"
                      id="total"
                      value={editQuotation.total}
                      onChange={handleEditChange}
                      required
                      className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="jobScope" className="block text-sm font-medium text-gray-700">Job Scope</label>
                {editQuotation.jobScope.map((scope, index) => (
                  <input
                    key={index}
                    type="text"
                    name="jobScope"
                    value={scope}
                    onChange={(e) => {
                      const newScope = [...editQuotation.jobScope];
                      newScope[index] = e.target.value;
                      setEditQuotation({ ...editQuotation, jobScope: newScope });
                    }}
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 mb-2"
                  />
                ))}
              </div>
              <div>
                <label htmlFor="items" className="block text-sm font-medium text-gray-700">Items</label>
                {editQuotation.items.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      name="itemName"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...editQuotation.items];
                        newItems[index].name = e.target.value;
                        setEditQuotation({ ...editQuotation, items: newItems });
                      }}
                      className="flex-1 mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                      placeholder="Item Name"
                    />
                    <input
                      type="text"
                      name="itemQuantity"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...editQuotation.items];
                        newItems[index].quantity = e.target.value;
                        setEditQuotation({ ...editQuotation, items: newItems });
                      }}
                      className="flex-1 mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                      placeholder="Quantity"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setEditQuotation(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConfirmationDetails;