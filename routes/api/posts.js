const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// bring in models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// ==================================================================
// @route    Post api/posts
// @desc     Create a post
// @access   Private
// ==================================================================

router.post(
  '/',
  [
    // express validator
    auth,
    [check('text', 'Text is required').not().isEmpty()],
  ],
  async (req, res) => {
    // check for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // get the user. How? enter token --> sends user ID -->  place in req.user.id 
      // dont send the password
      const user = await User.findById(req.user.id).select('-password');

      // create a new post
      const newPost = new Post({
        // using the text that comes from the body
        text: req.body.text,
        // rest comes from user
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      // create post
      const post = await newPost.save();

      // send post
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// Export
module.exports = router;
