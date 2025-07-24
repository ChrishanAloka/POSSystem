const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const salaryRouter = require('./routes/salary');
const quotationRoutes = require('./routes/quotationRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const invoiceRoutes = require('./routes/invoices');
const summaryRoutes = require('./routes/summary');
const path = require('path');

// Load .env from backend directory
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error.message);
  process.exit(1);
}

const startServer = async () => {
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.error('Failed to connect to MongoDB. API routes requiring database will fail.');
  }

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api/salary', salaryRouter);
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/employee', require('./routes/employee'));
  app.use('/api/attendance', require('./routes/attendance'));
  app.use('/api/quotations', quotationRoutes);
  app.use('/api/suppliers', supplierRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/summary', summaryRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'Server running', dbConnected });
  });

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  server.on('error', (err) => {
    console.error('Server error:', err.message);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please free the port and try again.`);
      process.exit(1);
    }
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});