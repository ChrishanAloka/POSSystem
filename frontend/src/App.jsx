import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import UserDetails from './components/UserDetails';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardCards from './components/DashboardCards';
import EmployeeRegister from './components/EmployeeRegister';
import EmployeeDetails from './components/EmployeeDetails';
import AttendanceMark from './components/AttendanceMark';
import AttendanceTable from './components/AttendanceTable';
import SalaryManagement from './components/SalaryManagement';
import ReportForm from './components/ReportForm';
import QuotationForm from './components/QuotationForm';
import QuotationList from './components/QuotationList';
import ConfirmationDetails from './components/ConfirmationDetails';
import SupplierForm from './components/SupplierForm';
import SupplierTable from './components/SupplierTable';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import SupplierEditForm from './components/SupplierEditForm';
import ProductEditForm from './components/ProductEditForm';
import PaymentForm from './components/PaymentForm';
import SupplierPaymentDetails from './components/SupplierPaymentDetails';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTable from './components/ExpenseTable';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import InvoiceQuotationSummary from './components/InvoiceQuotationSummary';
import './App.css';

function NotFound() {
  return <h1 className="text-3xl font-bold text-center text-gray-800">404 - Page Not Found</h1>;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-employee"
              element={
                <ProtectedRoute>
                  <EmployeeRegister />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <EmployeeDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/mark"
              element={
                <ProtectedRoute>
                  <AttendanceMark />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/records"
              element={
                <ProtectedRoute>
                  <AttendanceTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salary"
              element={
                <ProtectedRoute>
                  <SalaryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <h1 className="text-3xl font-bold text-center text-gray-800">Admin Dashboard</h1>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <h1 className="text-3xl font-bold text-center text-gray-800">Profile Management</h1>
                </ProtectedRoute>
              }
            />
            <Route path="/quotation" element={<QuotationForm />} />
            <Route path="/quotations" element={<QuotationList />} />
            <Route path="/confirmation" element={<ConfirmationDetails />} />
            <Route path="/reports" element={<ReportForm />} />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute>
                  <SupplierTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers/add"
              element={
                <ProtectedRoute>
                  <SupplierForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers/edit/:id"
              element={
                <ProtectedRoute>
                  <SupplierEditForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers/payment/:id"
              element={
                <ProtectedRoute>
                  <PaymentForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers/payment-details/:id"
              element={
                <ProtectedRoute>
                  <SupplierPaymentDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/add"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/edit/:id"
              element={
                <ProtectedRoute>
                  <ProductEditForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <ExpenseTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses/add"
              element={
                <ProtectedRoute>
                  <ExpenseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoice/add"
              element={
                <ProtectedRoute>
                  <InvoiceForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <InvoiceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/summary"
              element={
                <ProtectedRoute>
                  <InvoiceQuotationSummary />
                </ProtectedRoute>
              }
            />
            <Route path="/vehicles" element={<h1 className="text-3xl font-bold text-center text-gray-800">Vehicle Details</h1>} />
            <Route path="/sales" element={<h1 className="text-3xl font-bold text-center text-gray-800">Sales Representatives</h1>} />
            <Route path="/" element={<DashboardCards />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;