const app = require('./app');
const LemfModel = require('./models/lemfModel');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // Initialize the DB table if it doesn't exist
    await LemfModel.initializeTable();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
