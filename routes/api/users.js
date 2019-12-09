const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Importing models
const User = require('../../models/User');

// Importing gravatar
const gravatar = require('gravatar');

// For encrypting password
const bcrypt = require('bcryptjs');

// @route   POST api/users
// @desc    Register route
// @access  Public
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters')
  .isLength({ min: 6 })
],async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

 try{
  // See if user exists
  let user = await User.findOne({ email});
  if(user){
    return res.status(400).json({ errors: [{ msg: "User already exists" }] });
  }

  // Get user gravator
  const avatar = gravatar.url(email, {
    // s stands for Size
    s: '200',
    // r stands for Rating
    r: 'pg',
    // d stands for Default Image
    d: 'mm'
  })

  user = new User({
    name,
    email,
    avatar,
    password
  });

  // Encrypt password
  const salt = await bcrypt.genSalt(10);

  user.password = await bcrypt.hash(password, salt);

  await user.save();

  // Return jsonwebtoken

  res.send('User registered');
}catch(err){
  console.error(err.message);
  res.status(500).send("Server error");
}

});

module.exports = router;
