const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: [{
    type: String,
    required: true
  }],
  imageUrl: {
    type: String
  },
  githubUrl: {
    type: String
  },
  liveUrl: {
    type: String
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

ProjectSchema.index({ featured: 1, order: 1 });

ProjectSchema.index({ 
  title: 'text', 
  description: 'text',
  technologies: 'text'
}, {
  weights: {
    title: 10,
    technologies: 5,
    description: 1
  },
  name: 'project_text_index'
});

module.exports = mongoose.model('Project', ProjectSchema); 