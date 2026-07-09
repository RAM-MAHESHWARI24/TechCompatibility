const express = require('express');
const cors = require('cors');
const checkRoutes = require('./routes/checkRoutes');
const lemfRoutes = require('./routes/lemfRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/check', checkRoutes);
app.use('/api/lemf', lemfRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
