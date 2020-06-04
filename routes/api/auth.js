const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');
const bcrypt = require('bcryptjs');
// @route   GET api/auth
// @desc    Test route
// @access  Public

// the get method chains together `middleware`
// auth(req,res,next) where next == the next function
// looks for x-auth-token in get header
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route   Post api/auth
// @desc    Authenticate User & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'please include an email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      // user exist?
      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Creds' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Creds' }] });
      }
      // return token
      const payload = {
        user: {
          id: user.id,
        },
      };
      //   create signed jsonwebtoken
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: config.get('tokenExpire') },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
    }
  }
);
module.exports = router;
