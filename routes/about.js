const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const About = require('../models/About');

// @route   GET api/about
// @desc    Get about information
// @access  Public
router.get('/', async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/about
// @desc    Update about information
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    let about = await About.findOne();
    
    if (!about) {
      // Create new about if it doesn't exist
      about = new About(req.body);
      await about.save();
    } else {
      // Update existing about
      about = await About.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true }
      );
    }

    res.json(about);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 