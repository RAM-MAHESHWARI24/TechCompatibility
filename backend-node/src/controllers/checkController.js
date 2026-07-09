const db = require('../config/db');

exports.verifyStack = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT VERSION() as version');
    const dbVersion = rows[0]?.version || 'unknown';
    res.json({
      status: 'CONNECTED',
      dbVersion,
      timestamp: Date.now()
    });
  } catch (err) {
    res.status(500).json({
      status: 'DISCONNECTED',
      error: err.message,
      timestamp: Date.now()
    });
  }
};
