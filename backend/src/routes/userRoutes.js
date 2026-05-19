const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Example protected route
router.get('/profile', protect, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

router.put('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'avatar'];
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
    ).select('-password');
    
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

module.exports = router;