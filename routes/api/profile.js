const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// Bring in models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private

router.get('/me', auth, async (req, res) => {
  // Query
  try {
    // Call Profile Model, its user field, and get the user by id (which is in the token)
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    );

    // Check if no profile
    if (!profile) {
      return res.status(400).json({ mgs: 'There is no profile for this user' });
    }

    // If profile exists, send profile
    res.json(profile);

    // Catch error
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Export
module.exports = router;
