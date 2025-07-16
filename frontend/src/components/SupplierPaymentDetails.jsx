import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';

function SupplierPaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState({ supplier: {}, totalAmount: 0, totalPaid: 0, remainingAmount: 0, transactions: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://possystem-mjwb.onrender.com/api/suppliers/${id}/payment`);
        setPaymentData(response.data);
      } catch (err) {
        setError('Failed to fetch payment details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentData();
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Supplier Payment Details</h2>
        <button
          onClick={() => navigate('/suppliers')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 flex items-center"
        >
          <FaArrowLeft className="mr-1" /> Back
        </button>
      </div>
      {error && <p className="text-red-500 mb-4 text-center bg-red-100 p-2 rounded-md">{error}</p>}
      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {!loading && (
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Supplier Details</h3>
            <p><strong>Supplier ID:</strong> {paymentData.supplier.supplierId}</p>
            <p><strong>Name:</strong> {paymentData.supplier.name}</p>
            <p className="text-lg font-semibold mt-2">Remaining Amount: ${paymentData.remainingAmount.toFixed(2)}</p>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Payment Transactions</h3>
            <table className="min-w-full divide-y divide-gray-200 mt-2">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount Paid</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Remaining After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentData.transactions.map((trans, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">${trans.amountPaid.toFixed(2)}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{new Date(trans.paymentDate).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">${trans.remainingAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => navigate(`/suppliers/payment/${id}`)}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
          >
            Make a Payment
          </button>
        </div>
      )}
    </div>
  );
}

export default SupplierPaymentDetails;