const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

// bring in models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// ==================================================================
// @route    POST api/posts
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

// ==================================================================
// @route    GET api/posts
// @desc     Get all posts
// @access   Private
// ==================================================================

// add auth since its private
router.get('/', auth, async (req, res) => {
  try {
    // finding all posts and sorting by most recent
    const posts = await Post.find().sort({ date: -1 });
    // return posts
    res.json(posts);

    // catch error
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==================================================================
// @route    GET api/posts/:id
// @desc     Get post by id
// @access   Private
// ==================================================================

// add auth since its private
router.get('/:id', auth, async (req, res) => {
  try {
    // finding post by id. "req.params.id" allows us to get id from url
    const post = await Post.findById(req.params.id);

    // check if there is a post with that id
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // return post
    res.json(post);

    // catch error
  } catch (err) {
    console.error(err.message);

    // check if a valid object id was passed in. if its equal to ObjectId, it's not a formatted ObjectId.
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.status(500).send('Server Error');
  }
});

// ==================================================================
// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
// ==================================================================

// add auth since its private
router.delete('/:id', auth, async (req, res) => {
  try {
    // finding post by id. "req.params.id" allows us to get id from url
    const post = await Post.findById(req.params.id);

    // handle if post doesn't exist
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // check user
    // make sure user deleting post is owner of post
    // NOTE: req.user.id is a string. post.user is an object. SO add toString
    // If user is not equal to user id, return error
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // delete post
    await post.remove();

    // return message
    res.json({ msg: 'Post removed' });

    // catch error
  } catch (err) {
    console.error(err.message);

    // check if a valid object id was passed in. if its equal to ObjectId, it's not a formatted ObjectId.
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.status(500).send('Server Error');
  }
});

// Export
module.exports = router;
