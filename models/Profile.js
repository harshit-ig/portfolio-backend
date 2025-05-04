const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  resumeUrl: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  social: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema); 