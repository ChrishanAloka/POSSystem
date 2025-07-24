import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaFilePdf, FaFileExcel, FaSync } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function InvoiceQuotationSummary() {
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://possystem-eo7h.onrender.com/api/summary');
      setSummaries(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quotationId, invoiceId) => {
    if (window.confirm('Are you sure you want to delete this record? This will delete the quotation and associated invoice (if any).')) {
      try {
        await axios.delete(`https://possystem-eo7h.onrender.com/api/summary/${quotationId}`, {
          data: { invoiceId }
        });
        setSummaries(summaries.filter(summary => summary.quotationId !== quotationId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete record');
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Invoice and Quotation Summary', 14, 10);
    autoTable(doc, {
      head: [['Quotation No', 'Customer Name', 'Quotation Total (LKR)', 'Invoice No', 'Invoice Total (LKR)']],
      body: summaries.map(summary => [
        summary.quotationNo,
        summary.customerName,
        summary.quotationTotal,
        summary.invoiceNo || '-',
        summary.invoiceTotal || '-'
      ]),
      startY: 20,
      margin: { top: 10 },
      styles: { cellPadding: 2, fontSize: 10, overflow: 'linebreak' },
      columnStyles: { 
        0: { cellWidth: 30 }, 
        1: { cellWidth: 50 }, 
        2: { cellWidth: 30 }, 
        3: { cellWidth: 30 }, 
        4: { cellWidth: 30 }
      },
    });
    doc.save('invoice_quotation_summary.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(summaries.map(summary => ({
      'Quotation No': summary.quotationNo,
      'Customer Name': summary.customerName,
      'Quotation Total (LKR)': summary.quotationTotal,
      'Invoice No': summary.invoiceNo || '-',
      'Invoice Total (LKR)': summary.invoiceTotal || '-'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    XLSX.writeFile(wb, 'invoice_quotation_summary.xlsx');
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Invoice and Quotation Summary</h2>
        <div className="flex space-x-4">
          <button
            onClick={exportToPDF}
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-300 flex items-center"
            title="Export to PDF"
          >
            <FaFilePdf className="mr-2" /> PDF
          </button>
          <button
            onClick={exportToExcel}
            className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition duration-300 flex items-center"
            title="Export to Excel"
          >
            <FaFileExcel className="mr-2" /> Excel
          </button>
          <button
            onClick={fetchSummaries}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300 flex items-center disabled:opacity-50"
            title="Refresh Summary"
          >
            <FaSync className="mr-2" /> Refresh
          </button>
        </div>
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Quotation Total (LKR)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Invoice No</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Invoice Total (LKR)</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {summaries.map((summary) => (
              <tr key={summary.quotationId} className="hover:bg-gray-50 transition duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{summary.quotationNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{summary.customerName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{summary.quotationTotal}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{summary.invoiceNo || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{summary.invoiceTotal || '-'}</td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(summary.quotationId, summary.invoiceId)}
                    className="bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition duration-300 flex items-center justify-center"
                    title="Delete Record"
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

export default InvoiceQuotationSummary;