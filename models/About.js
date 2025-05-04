const mongoose = require('mongoose');

// Define experience schema
const ExperienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
});

// Define education schema
const EducationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: true,
    trim: true
  },
  institution: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
});

const AboutSchema = new mongoose.Schema({
  about: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  interests: {
    type: [String],
    default: []
  },
  experience: [ExperienceSchema],
  education: [EducationSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('About', AboutSchema); 