const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Get profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'avatar', 'bio', 'location', 'website', 'socialLinks', 'preferences'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get dashboard stats
router.get('/dashboard-stats', protect, async (req, res) => {
  try {
    const Resume = require('../models/Resume');
    const Portfolio = require('../models/Portfolio');
    
    const [resumeCount, portfolioCount, resumeViews, portfolioViews] = await Promise.all([
      Resume.countDocuments({ userId: req.user._id }),
      Portfolio.countDocuments({ userId: req.user._id }),
      Resume.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]),
      Portfolio.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: null, total: { $sum: '$analytics.views' } } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        totalResumes: resumeCount,
        totalPortfolios: portfolioCount,
        totalResumeViews: resumeViews[0]?.total || 0,
        totalPortfolioViews: portfolioViews[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;