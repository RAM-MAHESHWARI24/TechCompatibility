// Preserve original console references to prevent infinite recursion during logging
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

let isSending = false;

function sendLogToServer(level: 'INFO' | 'WARN' | 'ERROR', args: unknown[]) {
  if (isSending) return; // Prevent loops if fetch itself logs anything

  // Format arguments into a readable string
  const message = args
    .map((arg) => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');

  isSending = true;

  fetch('/api/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ level, message }),
  })
    .catch((err) => {
      originalError('[Logger] Failed to send log to backend:', err);
    })
    .finally(() => {
      isSending = false;
    });
}

// Override console methods
console.log = function (...args: unknown[]) {
  originalLog.apply(console, args);
  sendLogToServer('INFO', args);
};

console.warn = function (...args: unknown[]) {
  originalWarn.apply(console, args);
  sendLogToServer('WARN', args);
};

console.error = function (...args: unknown[]) {
  originalError.apply(console, args);
  sendLogToServer('ERROR', args);
};

// Capture global uncaught runtime errors
window.addEventListener('error', (event) => {
  const errorObj = event.error;
  const message = errorObj ? (errorObj.stack || errorObj.message) : event.message;
  sendLogToServer('ERROR', [`Uncaught Runtime Error: ${message}`]);
});

// Capture unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason instanceof Error ? (reason.stack || reason.message) : String(reason);
  sendLogToServer('ERROR', [`Unhandled Promise Rejection: ${message}`]);
});
