import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaMoneyBillWave } from 'react-icons/fa';

function SupplierTable() {
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('https://possystem-eo7h.onrender.com/api/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await axios.delete(`https://possystem-eo7h.onrender.com/api/suppliers/${id}`);
        fetchSuppliers();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/suppliers/edit/${id}`);
  };

  const handlePayment = (id) => {
    navigate(`/suppliers/payment/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Supplier Details</h2>
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow-2xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Supplier ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">NIC</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Address</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suppliers.map((supplier) => (
              <tr key={supplier._id} className="hover:bg-gray-50 transition duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.supplierId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.nic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{supplier.phone}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(supplier._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                      title="Edit Supplier"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(supplier._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition duration-300 flex items-center justify-center"
                      title="Delete Supplier"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                    <button
                      onClick={() => navigate(`/products/add?supplierId=${supplier._id}`)}
                      className="bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition duration-300 flex items-center justify-center"
                      title="Add Product"
                    >
                      <FaPlus className="mr-1" /> Add Product
                    </button>
                    <button
                      onClick={() => handlePayment(supplier._id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-full hover:bg-yellow-600 transition duration-300 flex items-center justify-center"
                      title="Make Payment"
                    >
                      <FaMoneyBillWave className="mr-1" /> Payment
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupplierTable;