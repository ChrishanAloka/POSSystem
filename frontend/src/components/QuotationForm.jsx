import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function QuotationForm() {
  const [quotationNo, setQuotationNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [jobScope, setJobScope] = useState(['']);
  const [items, setItems] = useState([{ name: '', quantity: '' }]);
  const [materialCost, setMaterialCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [total, setTotal] = useState('');
  const [error, setError] = useState('');
  const [headerImage, setHeaderImage] = useState(localStorage.getItem('quotationHeaderImage') || null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestQuotationNo();
  }, []);

  const fetchLatestQuotationNo = async () => {
    try {
      const res = await axios.get('https://possystem-mjwb.onrender.com/api/quotations/latest');
      const latestNo = res.data.latestNo || 0;
      setQuotationNo(`0000${latestNo + 1}`.slice(-5));
    } catch (err) {
      setError('Failed to fetch latest quotation number');
    }
  };

  const handleJobScopeChange = (index, value) => {
    const newJobScope = [...jobScope];
    newJobScope[index] = value;
    setJobScope(newJobScope);
  };

  const addJobScopeLine = () => {
    setJobScope([...jobScope, '']);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: '' }]);
  };

  useEffect(() => {
    const material = parseFloat(materialCost) || 0;
    const labor = parseFloat(laborCost) || 0;
    setTotal((material + labor).toFixed(2));
  }, [materialCost, laborCost]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        localStorage.setItem('quotationHeaderImage', imageData);
        setHeaderImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    if (window.confirm('Are you sure you want to delete the header image?')) {
      localStorage.removeItem('quotationHeaderImage');
      setHeaderImage(null);
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    
    let startY = 10;
    if (headerImage) {
      const imgWidth = 170;
      const img = new Image();
      img.src = headerImage;

      const loadImage = () => new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      await loadImage();

      const imgHeight = (img.height * imgWidth) / img.width;
      doc.addImage(headerImage, 'PNG', 20, 10, imgWidth, imgHeight);
      startY = 10 + imgHeight + 5;
    }

    // Set font for document
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Quotation Number (Top Left) and Date (Top Right)
    doc.text(`QUOTATION NO : ${quotationNo}`, 20, startY);
    doc.text(`DATE : ${new Date().toLocaleDateString("en-GB").split("/").reverse().join("/")}`, 190, startY, { align: "right" });

    // Centered Quotation Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", 105, startY + 10, { align: "center" });

    // Customer Details in a Table with Full Black Border
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    autoTable(doc, {
      head: [['Customer']],
      body: [[`${customerName}\n${address}`]],
      startY: startY + 20,
      margin: { left: 20, right: 100 },
      styles: {
        cellPadding: 2,
        fontSize: 10,
        font: "helvetica",
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: { bottom: 0.2, top: 0.2, left: 0.2, right: 0.2 }
      },
      showHead: false
    });

    // Job Scope
    doc.text("Quotation for:", 20, doc.lastAutoTable.finalY + 5);
    jobScope.forEach((line, index) => {
      if (line.trim()) {
        doc.setFont("helvetica", "normal");
        doc.text(line, 25, doc.lastAutoTable.finalY + 10 + (index * 3));
      }
    });

    // Items Table with Black Frame and White Header
    const jobScopeHeight = jobScope.filter(line => line.trim()).length * 3;
    doc.text('We use the following "PVC fittings":', 20, doc.lastAutoTable.finalY + 15 + jobScopeHeight);
    autoTable(doc, {
      head: [['No', 'Items', 'Qty', 'Amount (LKR)']],
      body: items.map((item, index) => [
        (index + 1).toString(),
        item.name || '',
        item.quantity || '',
        '' // Placeholder for amount, as it's not in current state
      ]),
      startY: doc.lastAutoTable.finalY + 20 + jobScopeHeight,
      margin: { left: 20, right: 20 },
      styles: {
        cellPadding: 2,
        fontSize: 10,
        font: "helvetica",
        textColor: [0, 0, 0],
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        font: "helvetica",
        fontStyle: "normal"
      },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 70 }, 2: { cellWidth: 20 }, 3: { cellWidth: 30 } }
    });

    // Costs Aligned to the Right
    const rightAlignX = 190;
    doc.text(`Material cost and consumable cost = LKR ${materialCost}`, rightAlignX, doc.lastAutoTable.finalY + 10, { align: "right" });
    doc.text(`Labor cost = LKR ${laborCost}`, rightAlignX, doc.lastAutoTable.finalY + 16, { align: "right" });
    doc.text(`TOTAL = LKR ${total}`, rightAlignX, doc.lastAutoTable.finalY + 22, { align: "right" });

    doc.save(`quotation_${quotationNo}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://possystem-mjwb.onrender.com/api/quotations', {
        quotationNo,
        customerName,
        address,
        jobScope: jobScope.filter(line => line.trim()),
        items,
        materialCost,
        laborCost,
        total,
        status: 'pending',
      });
      await generatePDF();
      navigate('/quotations');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quotation');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Create Quotation</h2>
      {error && <p className="text-red-500 mb-6 text-center bg-red-100 p-4 rounded-xl shadow-md">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Quotation No: {quotationNo}</h3>
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-700 mb-2">Header Image</h4>
            {headerImage ? (
              <div className="relative">
                <img src={headerImage} alt="Header" className="max-w-xs h-auto mb-2 rounded" />
                <button
                  onClick={handleDeleteImage}
                  className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition duration-300"
                >
                  Delete Image
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 mb-4 border rounded"
              />
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Customer Details</h3>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="w-full p-2 mb-4 border rounded"
            required
          />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Job Scope</h3>
          {jobScope.map((line, index) => (
            <input
              key={index}
              type="text"
              value={line}
              onChange={(e) => handleJobScopeChange(index, e.target.value)}
              placeholder={`Scope Line ${index + 1}`}
              className="w-full p-2 mb-2 border rounded"
            />
          ))}
          <button
            type="button"
            onClick={addJobScopeLine}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Add Scope Line
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Items</h3>
          {items.map((item, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder="Item Name"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="text"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  placeholder="Quantity"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Add Item
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Costs</h3>
          <input
            type="number"
            value={materialCost}
            onChange={(e) => setMaterialCost(e.target.value)}
            placeholder="Material Cost (LKR)"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="number"
            value={laborCost}
            onChange={(e) => setLaborCost(e.target.value)}
            placeholder="Labor Cost (LKR)"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <p className="text-lg font-semibold">Total: LKR {total}</p>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition w-full"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuotationForm;