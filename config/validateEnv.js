const validateEnv = () => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'CLIENT_URL'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MONGODB_URI format');
  }

  // Validate JWT secret length
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate port number
  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('Invalid PORT number');
  }

  // Validate client URL format
  try {
    new URL(process.env.CLIENT_URL);
  } catch (error) {
    throw new Error('Invalid CLIENT_URL format');
  }

  // Set default values for optional environment variables
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
};

module.exports = validateEnv; 