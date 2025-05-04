const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Get profile
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    
    // If no profile exists, create a default one
    if (!profile) {
      profile = new Profile({
        name: 'Your Name',
        title: 'Web Developer',
        bio: 'A passionate web developer with experience in modern web technologies.',
        about: 'This is a longer description about yourself. You can update this from the admin dashboard.',
        location: 'City, Country',
        email: 'your.email@example.com',
        phone: '+1 (123) 456-7890',
        social: {
          github: 'https://github.com/',
          linkedin: 'https://linkedin.com/in/',
          twitter: 'https://twitter.com/',
          instagram: 'https://instagram.com/'
        },
        skills: {
          frontend: ['React', 'TypeScript', 'HTML', 'CSS'],
          backend: ['Node.js', 'Express', 'MongoDB'],
          tools: ['Git', 'VS Code', 'Docker']
        }
      });
      await profile.save();
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile (protected route)
router.put('/', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne();
    
    if (!profile) {
      profile = new Profile(req.body);
    } else {
      Object.assign(profile, req.body);
    }
    
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload avatar (protected route)
router.post('/avatar', auth, async (req, res) => {
  try {
    // TODO: Implement file upload logic
    // For now, just return a placeholder URL
    res.json({ avatarUrl: 'https://via.placeholder.com/150' });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload resume (protected route)
router.post('/resume', auth, async (req, res) => {
  try {
    // TODO: Implement file upload logic
    // For now, just return a placeholder URL
    res.json({ resumeUrl: 'https://via.placeholder.com/resume.pdf' });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 