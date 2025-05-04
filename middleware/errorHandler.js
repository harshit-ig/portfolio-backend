// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Format MongoDB validation errors
const formatMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => ({
    field: el.path,
    message: el.message
  }));
  
  return {
    status: 'fail',
    message: 'Validation error',
    errors
  };
};

// Format MongoDB duplicate key errors
const formatMongoDuplicateKeyError = (err) => {
  // Extract field name from the error message
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  
  return {
    status: 'fail',
    message: `Duplicate field value: ${field} already exists with value ${value}`,
    field
  };
};

// Different behavior for development and production
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message
    });
  }
  
  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error(`${req.method} ${req.originalUrl}: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Default to 500 internal server error if statusCode not set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle different types of errors
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = new AppError('Validation failed', 400);
    error.formattedError = formatMongooseValidationError(err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = new AppError('Duplicate field value', 400);
    error.formattedError = formatMongoDuplicateKeyError(err);
  }
  
  // Mongoose CastError (invalid ID)
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }

  // File upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    }
    error = new AppError(message, 400);
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    if (error.formattedError) {
      res.status(error.statusCode).json(error.formattedError);
    } else {
      sendErrorProd(error, res);
    }
  }
};

module.exports = { 
  errorHandler,
  AppError
}; 