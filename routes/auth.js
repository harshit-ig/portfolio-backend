const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const { validate, commonRules } = require('../middleware/validator');
const { loginLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');

// @route   POST api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', 
  loginLimiter,
  [
    check('email', commonRules.email.errorMessage).isEmail().normalizeEmail(),
    check('password', 'Password is required').exists()
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      let user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Invalid Credential' 
        });
      }
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          status: 'error',
          message: 'Invalid Credentials' 
        });
      }

      // Return JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '12h' },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            status: 'success',
            token 
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ 
        status: 'error',
        message: 'Server error' 
      });
    }
  }
);

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ 
      status: 'success',
      data: user 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      status: 'error',
      message: 'Server Error' 
    });
  }
});

// @route   PUT api/auth/password
// @desc    Update user password
// @access  Private
router.put('/password',
  auth,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', commonRules.password.errorMessage)
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
  ],
  validate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id).select('+password');

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();

      res.json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: 'error',
        message: 'Server Error'
      });
    }
  }
);

module.exports = router; 
 