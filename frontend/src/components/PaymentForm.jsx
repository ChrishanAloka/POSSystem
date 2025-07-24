import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';

function PaymentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState({ supplier: {}, products: [], totalAmount: 0, totalPaid: 0, remainingAmount: 0, transactions: [] });
  const [paidAmount, setPaidAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://possystem-eo7h.onrender.com/api/suppliers/${id}/payment`);
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

  const handlePaidAmountChange = (e) => {
    setPaidAmount(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const paid = parseFloat(paidAmount) || 0;
      if (paid > paymentData.remainingAmount) {
        setError('Paid amount exceeds remaining amount.');
        return;
      }
      await axios.post(`https://possystem-eo7h.onrender.com/api/suppliers/${id}/payment`, { amountPaid: paid });
      setPaidAmount('');
      const response = await axios.get(`https://possystem-eo7h.onrender.com/api/suppliers/${id}/payment`);
      setPaymentData(response.data);
      setError(paid === paymentData.remainingAmount ? 'Payment complete' : `Remaining amount: ${response.data.remainingAmount}`);
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payment for Supplier</h2>
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
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Products</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">GRN No</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentData.products.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{product.grnNo}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{product.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{product.quantity}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold">Total Amount: ${paymentData.totalAmount.toFixed(2)}</p>
            <p className="text-lg font-semibold">Total Paid: ${paymentData.totalPaid.toFixed(2)}</p>
            <p className="text-lg font-semibold">Remaining Amount: ${paymentData.remainingAmount.toFixed(2)}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
              <input
                type="number"
                value={paidAmount}
                onChange={handlePaidAmountChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
                max={paymentData.remainingAmount}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !paidAmount}
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div> : 'Submit Payment'}
            </button>
          </form>
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Past Transactions</h3>
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
        </div>
      )}
    </div>
  );
}

export default PaymentForm;