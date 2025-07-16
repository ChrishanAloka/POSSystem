import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductForm() {
  const [formData, setFormData] = useState({
    grnNo: '',
    name: '',
    category: '',
    quantity: '',
    price: '',
    supplierId: '', // This will hold the Supplier's ObjectId
  });
  const [supplierName, setSupplierName] = useState('');
  const [customSupplierId, setCustomSupplierId] = useState(''); // To store the custom supplierId for display
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const supplierObjectId = searchParams.get('supplierId');
    if (supplierObjectId) {
      const fetchSupplier = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:5000/api/suppliers/${supplierObjectId}`);
          const { _id, supplierId, name } = response.data;
          setFormData((prev) => ({ ...prev, supplierId: _id })); // Use the Supplier's ObjectId
          setCustomSupplierId(supplierId); // Store the custom supplierId for display
          setSupplierName(name);
        } catch (err) {
          setError('Failed to fetch supplier details. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchSupplier();
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/products', formData);
      navigate('/products');
    } catch (err) {
      setError('Failed to add product. Please check the data and try again.');
      console.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">Add Product</h2>
      {error && <p className="text-red-500 mb-4 text-center bg-red-100 p-2 rounded-md">{error}</p>}
      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">GRN No</label>
          <input
            type="text"
            name="grnNo"
            value={formData.grnNo}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="flex justify-between">
          <div className="w-1/2 pr-2">
            <label className="block text-sm font-medium text-gray-700">Supplier ID</label>
            <input
              type="text"
              value={customSupplierId}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              required
            />
          </div>
          <div className="w-1/2 pl-2">
            <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
            <input
              type="text"
              value={supplierName}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div> : 'Add Product'}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;