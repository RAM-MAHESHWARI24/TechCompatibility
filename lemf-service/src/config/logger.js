const fs = require('fs');
const path = require('path');
const util = require('util');

// Ensure the logs directory exists
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'app.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Store original console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

/**
 * Format a log entry with a timestamp, level, and formatted arguments.
 */
function formatLog(level, args) {
  const timestamp = new Date().toISOString();
  // util.format handles string interpolation, objects, etc., like console.log does
  const message = util.format(...args);
  return `[${timestamp}] [${level}] ${message}\n`;
}

// Override console.log
console.log = function (...args) {
  const formatted = formatLog('INFO', args);
  logStream.write(formatted);
  originalLog.apply(console, args);
};

// Override console.error
console.error = function (...args) {
  const formatted = formatLog('ERROR', args);
  logStream.write(formatted);
  originalError.apply(console, args);
};

// Override console.warn
console.warn = function (...args) {
  const formatted = formatLog('WARN', args);
  logStream.write(formatted);
  originalWarn.apply(console, args);
};

// Optional: clean up stream on process exit
process.on('exit', () => {
  logStream.end();
});
