const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// @route    GET api/auth
// @desc     Test route
// @access   Public

// Getting protected data
router.get('/', auth, async (req, res) => {
    
    // Call to database using try catch
    try {
       // Find user by id
        const user = await User.findById(req.user.id).select('-password');

        // Send user data
        res.json(user);

    } catch(err) {
        // Return error
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Export
module.exports = router;