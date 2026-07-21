const express = require('express');
const cors = require('cors');
const path = require('path');
const checkRoutes = require('./routes/checkRoutes');
const lemfRoutes = require('./routes/lemfRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  if (req.originalUrl === '/api/logs') {
    return next();
  }
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${duration}ms`);
  });
  next();
});

// Route for receiving frontend logs
app.post('/api/logs', (req, res) => {
  const { level, message } = req.body;
  const prefixedMessage = `[Front-End] ${message}`;

  if (level === 'ERROR') {
    console.error(prefixedMessage);
  } else if (level === 'WARN') {
    console.warn(prefixedMessage);
  } else {
    console.log(prefixedMessage);
  }

  res.sendStatus(204);
});

// Routes
app.use('/api/check', checkRoutes);
app.use('/api/lemf', lemfRoutes);
app.use('/api/auth', authRoutes);

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all route to serve the frontend index.html for client-side routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
