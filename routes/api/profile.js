const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
// For post, bring this in
const { check, validationResult } = require('express-validator');

// Bring in models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// ==================================================================
// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
// ==================================================================

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

// ==================================================================
// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
// ==================================================================

router.post(
  '/',
  // Using express-validator
  [
    // Middleware
    auth,
    [
      // Check Status
      check('status', 'Status is required').not().isEmpty(),
      // Check Skills
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  // Using data (async)
  async (req, res) => {
    // Validate results
    const errors = validationResult(req);

    // Check above validation (If error, return response)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Pulling stuff out from the req.body
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};

    // Get correct user (using Profile Model)
    profileFields.user = req.user.id;

    // --------------------------------
    // Add fields
    // ---------------------------------

    // Add each field to profile
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    // Turn skills into array using .split (turns a string into an array). Then take in a comma
    // Use .map so spaces don't matter
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // --------------------------------
    // Add fields for Social, which is an object
    // --------------------------------

    // Build social object
    profileFields.social = {};

    // Checks
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    // --------------------------------
    // Update Profile
    // --------------------------------
    try {
      // Find by user (req.user.id comes from the token)
      // Note: Since we are using async await, when we use mongoose method .findOne, it returns a promise, so put keyword await
      let profile = await Profile.findOne({ user: req.user.id });

      // --------------------------------
      // If profile is found...
      // --------------------------------
      if (profile) {
        // Update profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        // Return profile
        return res.json(profile);
      }

      // --------------------------------
      // If profile is not found...
      // --------------------------------

      // Create profile
      profile = new Profile(profileFields);

      // Save profile
      await profile.save();

      // Return Profile
      res.json(profile);

      // --------------------------------
      // Catch error
      // --------------------------------
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// ==================================================================
// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
// ==================================================================

router.get('/', async (req, res) => {
  try {
    // Get all profiles
    // Add name and avatar using .populate
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);

    // Send profiles
    res.json(profiles);

    // Catch error
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==================================================================
// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
// ==================================================================

router.get('/user/:user_id', async ({ params: { user_id } }, res) => {
  try {
    // Get profile from user ID
    const profile = await Profile.findOne({
      user: user_id,
    }).populate('user', ['name', 'avatar']);

    // Check if profile does not exist for the user
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });

    // Send profile
    return res.json(profile);

    // Catch error
  } catch (err) {
    console.error(err.message);
    // Check error kind 
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
});

// Export
module.exports = router;
