const express = require('express');
const userService = require('../services/userService.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const jwt = require("jsonwebtoken");

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const user = await userService.register(req.body);
    return {data: user};
  } catch (error) {
    return {error: error};
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await userService.authenticate(email, password);
    const jwtToken = jwt.sign({id: user._id}, process.env.JWT_SECRET || "secret", {expiresIn: '12h'});
    res.send({data: {token: jwtToken}});
  } catch (error) {
    res.send({error: error.message});
  }
});

// Get user profile (Protected)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await userService.findById(req.user._id);
    res.send({data: user});
  } catch (error) {
    res.send({error: error.message});
  }
});

// Update user profile (Protected)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.user.id, req.body);
    const user = await userService.findById(req.user._id);
    res.send({data: user});
  } catch (error) {
    res.send({error: error.message});
    ;
  }
});

// Delete user (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await userService.deleteUser(req.params.id);
    return {data: message};
  } catch (error) {
    return {error: error};
  }
});

module.exports = router;