import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ExpenseForm() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://possystem-mjwb.onrender.com/api/expenses/categories');
        setCategories(response.data);
      } catch (err) {
        setError('Failed to fetch categories.');
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) return;
    try {
      await axios.post('https://possystem-mjwb.onrender.com/api/expenses/categories', { name: newCategory });
      setNewCategory('');
      const response = await axios.get('https://possystem-mjwb.onrender.com/api/expenses/categories');
      setCategories(response.data);
    } catch (err) {
      setError('Failed to add category.');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://possystem-mjwb.onrender.com/api/expenses', {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description || '',
      });
      setFormData({ name: '', price: '', description: '' });
      navigate('/expenses');
    } catch (err) {
      setError('Failed to add expense.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Expense</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Expense Name</label>
          <select
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select or add an expense</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Add New Category</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="New category name"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter description"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Expense
        </button>
      </form>
    </div>
  );
}

export default ExpenseForm;