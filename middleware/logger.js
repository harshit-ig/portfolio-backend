const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Create a write stream for error logs
const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom morgan token for request body
morgan.token('body', (req) => {
  const sanitizedBody = { ...req.body };
  
  // Remove sensitive fields
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
  
  return JSON.stringify(sanitizedBody);
});

// Custom morgan token for response body
morgan.token('response-body', (req, res) => {
  const rawResponse = res.__morgan_body;
  
  // If no response body captured, return empty string
  if (!rawResponse) return '';
  
  try {
    // Parse and sanitize if JSON
    const parsedResponse = JSON.parse(rawResponse);
    
    // Sanitize sensitive data
    if (parsedResponse.token) parsedResponse.token = '[REDACTED]';
    if (parsedResponse.password) parsedResponse.password = '[REDACTED]';
    
    return JSON.stringify(parsedResponse);
  } catch (e) {
    // If not JSON, return raw string but truncate if too long
    return rawResponse.length > 200 ? rawResponse.substring(0, 200) + '...' : rawResponse;
  }
});

// Response body capturing middleware
const captureResponseBody = (req, res, next) => {
  // Save the original end method
  const originalEnd = res.end;
  
  // Variable to store the response body
  let chunks = [];
  
  // Override the write method to capture the response body
  const originalWrite = res.write;
  res.write = function(chunk) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return originalWrite.apply(res, arguments);
  };
  
  // Override the end method
  res.end = function(chunk) {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    
    // Combine all chunks and store in res for morgan token to access
    const body = Buffer.concat(chunks).toString('utf8');
    res.__morgan_body = body;
    
    // Call the original end method
    originalEnd.apply(res, arguments);
  };
  
  next();
};

// Create loggers for different environments
const developmentLogger = [
  captureResponseBody,
  morgan(':method :url :status :response-time ms - :body - :response-body', {
    skip: (req, res) => res.statusCode >= 400
  }),
  morgan(':method :url :status :response-time ms - :body - :response-body', {
    skip: (req, res) => res.statusCode < 400,
    stream: errorLogStream
  })
];

const productionLogger = [
  captureResponseBody,
  morgan(':method :url :status :response-time ms - :remote-addr', {
    skip: (req, res) => res.statusCode >= 400,
    stream: accessLogStream
  }),
  morgan(':method :url :status :response-time ms - :remote-addr - :body', {
    skip: (req, res) => res.statusCode < 400,
    stream: errorLogStream
  })
];

module.exports = process.env.NODE_ENV === 'production' 
  ? productionLogger 
  : developmentLogger; 