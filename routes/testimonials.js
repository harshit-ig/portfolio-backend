const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Testimonial = require('../models/Testimonial');

// @route   GET api/testimonials
// @desc    Get all testimonials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1 });
    res.json(testimonials);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/testimonials
// @desc    Create a testimonial
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newTestimonial = new Testimonial({
      name: req.body.name,
      position: req.body.position,
      company: req.body.company,
      content: req.body.content,
      imageUrl: req.body.imageUrl,
      featured: req.body.featured,
      order: req.body.order
    });

    const testimonial = await newTestimonial.save();
    res.json(testimonial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/testimonials/:id
// @desc    Update a testimonial
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ msg: 'Testimonial not found' });
    }

    testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(testimonial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/testimonials/:id
// @desc    Delete a testimonial
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ msg: 'Testimonial not found' });
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Testimonial removed' });
  } catch (err) {
    console.error('Error in delete testimonial route:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router; 