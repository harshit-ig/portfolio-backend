const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Common validation rules
const commonRules = {
  id: {
    in: ['params'],
    isMongoId: true,
    errorMessage: 'Invalid ID format'
  },
  email: {
    in: ['body'],
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'Please enter a valid email address'
  },
  password: {
    in: ['body'],
    isLength: {
      min: 8,
      errorMessage: 'Password must be at least 8 characters long'
    },
    matches: {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    }
  }
};

// Project validation rules
const projectRules = {
  title: {
    in: ['body'],
    trim: true,
    notEmpty: {
      errorMessage: 'Project title is required'
    },
    isLength: {
      options: { min: 3, max: 100 },
      errorMessage: 'Title must be between 3 and 100 characters'
    }
  },
  description: {
    in: ['body'],
    trim: true,
    notEmpty: {
      errorMessage: 'Project description is required'
    },
    isLength: {
      options: { min: 10, max: 1000 },
      errorMessage: 'Description must be between 10 and 1000 characters'
    }
  },
  technologies: {
    in: ['body'],
    isArray: {
      errorMessage: 'Technologies must be an array'
    }
  },
  'technologies.*': {
    in: ['body'],
    isString: {
      errorMessage: 'Each technology must be a string'
    }
  },
  githubUrl: {
    in: ['body'],
    optional: { nullable: true, checkFalsy: true },
    isURL: {
      errorMessage: 'Github URL must be a valid URL'
    }
  },
  liveUrl: {
    in: ['body'],
    optional: { nullable: true, checkFalsy: true },
    isURL: {
      errorMessage: 'Live URL must be a valid URL'
    }
  },
  featured: {
    in: ['body'],
    optional: { nullable: true },
    isBoolean: {
      errorMessage: 'Featured must be a boolean'
    }
  },
  order: {
    in: ['body'],
    optional: { nullable: true },
    isInt: {
      errorMessage: 'Order must be an integer'
    }
  }
};

module.exports = {
  validate,
  commonRules,
  projectRules
}; 