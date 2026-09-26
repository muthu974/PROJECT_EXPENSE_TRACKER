const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const statsRoutes = require('./routes/statsRoutes');
const errorHandler = require('./middleware/errorHandler');
const { Transaction } = require('./models/Transaction');
const dns = require("dns");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
dns.setServers(['8.8.8.8']);


// API Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// CSV Export
app.get('/api/export/csv', async (req, res) => {
  try {
    const { month, type, category } = req.query;
    const filter = {};

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      filter.date = {
        $gte: new Date(year, mon - 1, 1),
        $lte: new Date(year, mon, 0, 23, 59, 59, 999)
      };
    }
    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    const header = 'Date,Type,Category,Description,Amount\n';
    const rows = transactions.map((t) => {
      const date = new Date(t.date).toLocaleDateString('en-IN');
      const desc = `"${t.description.replace(/"/g, '""')}"`;
      return `${date},${t.type},${t.category},${desc},${t.amount}`;
    });

    const csv = header + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.status(200).send(csv);
  } catch (error) {
    console.error('CSV export error:', error.message);
    res.status(500).json({ success: false, message: 'Export failed' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n  Port ${PORT} is already in use by another running process.`);
      console.error(` Run this in PowerShell to free it:\n   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
});
