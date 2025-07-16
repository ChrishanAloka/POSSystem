import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function InvoiceForm() {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [poNo, setPoNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [jobDetails, setJobDetails] = useState([{ no: 1, description: '', qty: '', amount: '' }]);
  const [total, setTotal] = useState('');
  const [error, setError] = useState('');
  const [headerImage, setHeaderImage] = useState(localStorage.getItem('invoiceHeaderImage') || null);
  const navigate = useNavigate();
  const location = useLocation();
  const quotationId = new URLSearchParams(location.search).get('quotationId');

  useEffect(() => {
    fetchLatestInvoiceNo();
  }, []);

  const fetchLatestInvoiceNo = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/invoices/latest');
      const latestNo = res.data.latestNo || 0;
      const nextNo = latestNo + 1;
      // Ensure invoice number is padded to 5 digits after "INV" (total 8 characters)
      setInvoiceNo(`INV${String(nextNo).padStart(5, '0')}`);
    } catch (err) {
      setError('Failed to fetch latest invoice number');
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        localStorage.setItem('invoiceHeaderImage', imageData);
        setHeaderImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    if (window.confirm('Are you sure you want to delete the header image?')) {
      localStorage.removeItem('invoiceHeaderImage');
      setHeaderImage(null);
    }
  };

  const handleJobDetailChange = (index, field, value) => {
    const newJobDetails = [...jobDetails];
    newJobDetails[index][field] = value;
    setJobDetails(newJobDetails);
    calculateTotal(newJobDetails);
  };

  const addJobDetailRow = () => {
    const newJobDetails = [...jobDetails, { no: jobDetails.length + 1, description: '', qty: '', amount: '' }];
    setJobDetails(newJobDetails);
    calculateTotal(newJobDetails);
  };

  const calculateTotal = (details) => {
    const totalAmount = details.reduce((sum, detail) => sum + (parseFloat(detail.amount) || 0), 0);
    setTotal(totalAmount.toFixed(2));
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
      startY = 10 + imgHeight;
    }

    // Title "INVOICE" centered
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("INVOICE", 105, startY + 10, { align: "center" });
    startY += 20;

    // Right-side box for Invoice No, PO No, Date
    const boxX = 130;
    const boxWidth = 60;
    const boxHeight = 40;
    doc.setDrawColor(0); // Black border
    doc.setFillColor(255, 255, 255); // White background
    doc.rect(boxX, startY, boxWidth, boxHeight, 'FD'); // Draw filled rectangle
    doc.setFontSize(10);
    doc.text("Invoice No:", boxX + 5, startY + 8);
    doc.text(invoiceNo, boxX + 5, startY + 14);
    doc.text("PO No:", boxX + 5, startY + 20);
    doc.text(poNo, boxX + 5, startY + 26);
    doc.text("Date:", boxX + 5, startY + 32);
    doc.text(new Date().toLocaleDateString("en-GB").split("/").reverse().join("/"), boxX + 5, startY + 38);

    // Left-side customer details
    doc.setFontSize(10);
    doc.text("Customer Name", 20, startY + 8);
    doc.text(customerName, 20, startY + 14);
    doc.text("Address", 20, startY + 20);
    doc.text(address, 20, startY + 26);
    doc.text(`Attention: ${customerName}`, 20, startY + 32); // Assuming customerName as attention name

    startY += boxHeight + 10;

    // Job Details table with black frame
    doc.text("Job Details:", 20, startY);
    autoTable(doc, {
      head: [['No', 'Description', 'Qty', 'Amount (LKR)']],
      body: jobDetails.map((detail) => [
        detail.no,
        detail.description || '',
        detail.qty || '',
        detail.amount || '',
      ]),
      startY: startY + 6,
      margin: { left: 20 },
      styles: { 
        cellPadding: 2, 
        fontSize: 10, 
        font: "helvetica",
        lineWidth: 0.5, // Black frame
        lineColor: [0, 0, 0], // Black
      },
      headStyles: { 
        fillColor: [255, 255, 255], // No blue, white background
        textColor: [0, 0, 0], // Black text
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 70 }, 2: { cellWidth: 20 }, 3: { cellWidth: 30 } },
    });

    // Total
    doc.text(`TOTAL : LKR ${total}`, 20, doc.lastAutoTable.finalY + 10);

    doc.save(`invoice_${invoiceNo}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        invoiceNo,
        poNo,
        customerName,
        address,
        jobDetails,
        total,
        quotationId,
        status: 'pending',
      };
      await axios.post('http://localhost:5000/api/invoices', invoiceData);
      await generatePDF();
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save invoice');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Create Invoice</h2>
      {error && <p className="text-red-500 mb-6 text-center bg-red-100 p-4 rounded-xl shadow-md">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Invoice No: {invoiceNo}</h3>
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
          <input
            type="text"
            value={poNo}
            onChange={(e) => setPoNo(e.target.value)}
            placeholder="PO No"
            className="w-full p-2 mb-4 border rounded"
            required
          />
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
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Job Details</h3>
          {jobDetails.map((detail, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={detail.no}
                readOnly
                className="w-1/6 p-2 border rounded bg-gray-100"
              />
              <input
                type="text"
                value={detail.description}
                onChange={(e) => handleJobDetailChange(index, 'description', e.target.value)}
                placeholder="Description"
                className="flex-1 p-2 border rounded"
              />
              <input
                type="text"
                value={detail.qty}
                onChange={(e) => handleJobDetailChange(index, 'qty', e.target.value)}
                placeholder="Qty"
                className="w-1/6 p-2 border rounded"
              />
              <input
                type="number"
                value={detail.amount}
                onChange={(e) => handleJobDetailChange(index, 'amount', e.target.value)}
                placeholder="Amount"
                className="w-1/6 p-2 border rounded"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addJobDetailRow}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Add Row
          </button>
          <p className="text-lg font-semibold mt-4">Total: LKR {total}</p>
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

export default InvoiceForm;