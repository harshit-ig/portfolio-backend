const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const { validate, commonRules, projectRules } = require('../middleware/validator');
const { checkSchema } = require('express-validator');

// @route   GET api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const featured = req.query.featured === 'true' ? true : undefined;
    
    // Build filter object
    const filter = {};
    if (featured !== undefined) {
      filter.featured = featured;
    }
    
    // Execute query with pagination
    const projects = await Project.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Project.countDocuments(filter);
    
    res.json({
      status: 'success',
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(`Error fetching projects: ${err.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching projects',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET api/projects/search
// @desc    Search projects by query
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }
    
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Execute text search
    const projects = await Project.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Project.countDocuments({ $text: { $search: q } });
    
    res.json({
      status: 'success',
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(`Error searching projects: ${err.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Server error while searching projects',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   POST api/projects
// @desc    Create a project
// @access  Private
router.post('/', [
  auth,
  checkSchema({
    title: projectRules.title,
    description: projectRules.description,
    technologies: projectRules.technologies,
    'technologies.*': projectRules['technologies.*'],
    githubUrl: projectRules.githubUrl,
    liveUrl: projectRules.liveUrl,
    featured: projectRules.featured,
    order: projectRules.order
  }),
  validate
], async (req, res) => {
  try {
    const newProject = new Project({
      title: req.body.title,
      description: req.body.description,
      technologies: req.body.technologies,
      imageUrl: req.body.imageUrl,
      githubUrl: req.body.githubUrl,
      liveUrl: req.body.liveUrl,
      featured: req.body.featured,
      order: req.body.order
    });

    const project = await newProject.save();
    res.status(201).json({
      status: 'success',
      data: project,
      message: 'Project created successfully'
    });
  } catch (err) {
    console.error(`Error creating project: ${err.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating project',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', [
  auth,
  checkSchema({
    id: commonRules.id,
    title: { ...projectRules.title, optional: true },
    description: { ...projectRules.description, optional: true },
    technologies: { ...projectRules.technologies, optional: true },
    'technologies.*': projectRules['technologies.*'],
    githubUrl: projectRules.githubUrl,
    liveUrl: projectRules.liveUrl,
    featured: projectRules.featured,
    order: projectRules.order
  }),
  validate
], async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Project not found' 
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      status: 'success',
      data: project,
      message: 'Project updated successfully'
    });
  } catch (err) {
    console.error(`Error updating project: ${err.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating project',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', [
  auth,
  checkSchema({
    id: commonRules.id
  }),
  validate
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Project not found' 
      });
    }

    await Project.deleteOne({ _id: req.params.id });
    res.json({ 
      status: 'success',
      message: 'Project removed successfully' 
    });
  } catch (err) {
    console.error(`Error deleting project: ${err.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting project',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 