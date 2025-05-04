const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create different upload folders based on file type
const imageUploadsDir = path.join(uploadsDir, 'images');
const documentUploadsDir = path.join(uploadsDir, 'documents');

if (!fs.existsSync(imageUploadsDir)) {
  fs.mkdirSync(imageUploadsDir, { recursive: true });
}

if (!fs.existsSync(documentUploadsDir)) {
  fs.mkdirSync(documentUploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Select destination based on file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, imageUploadsDir);
    } else {
      cb(null, documentUploadsDir);
    }
  },
  filename: (req, file, cb) => {
    // Generate a secure random filename
    const hashName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Store original filename in request for logging
    if (!req.fileData) req.fileData = {};
    req.fileData.originalName = file.originalname;
    
    cb(null, `${hashName}${ext}`);
  }
});

// File type validation
const validateFileType = (file) => {
  // Allowed file types with extensions
  const allowedTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'application/pdf': ['.pdf'],
  };
  
  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check if mimetype is allowed
  if (!allowedTypes[file.mimetype]) {
    return {
      valid: false,
      message: 'Invalid file type. Only JPEG, PNG, GIF and PDF files are allowed.'
    };
  }
  
  // Check if extension matches mimetype
  if (!allowedTypes[file.mimetype].includes(ext)) {
    return {
      valid: false,
      message: `File extension does not match the declared file type.`
    };
  }
  
  return { valid: true };
};

// File filter
const fileFilter = (req, file, cb) => {
  const validationResult = validateFileType(file);
  
  if (validationResult.valid) {
    cb(null, true);
  } else {
    cb(new Error(validationResult.message), false);
  }
};

// Configure upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file per upload
  }
});

// Middleware for handling upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Only one file is allowed.'
      });
    }
    return res.status(400).json({
      status: 'error',
      message: `File upload error: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  
  next();
};

// This is a placeholder for virus scanning functionality
// In a production environment, you should integrate with an actual virus scanning service
const scanForViruses = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  // Log file upload info
  console.log(`File uploaded: ${req.fileData?.originalName || 'unknown'} → ${req.file.filename}`);
  
  // In a real implementation, you would scan the file here
  // and delete it if it fails the virus scan
  
  // Add file info to request for further use
  req.secureFile = {
    filename: req.file.filename,
    path: req.file.path,
    mimetype: req.file.mimetype,
    size: req.file.size,
    originalName: req.fileData?.originalName
  };
  
  next();
};

module.exports = {
  upload,
  handleUploadError,
  scanForViruses
}; 