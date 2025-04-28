const express = require('express');
const userService = require('../services/userService.js');
const authMiddleware = require('../middlewares/authMiddleware.js');
const jwt = require("jsonwebtoken");

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const user = await userService.register(req.body);
    res.send({data: user});
  } catch (error) {
    res.send({error: error.message});
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

// Get all users (Protected - Admin Only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).send({error: 'Access denied. Admin privileges required.'});
    }

    const users = await userService.find();
    res.send({data: users});
  } catch (error) {
    res.send({error: error.message});
  }
});

// Get user count (Protected - Admin Only)
router.get('/count', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).send({error: 'Access denied. Admin privileges required.'});
    }

    const count = await userService.getUserCount();
    res.send({data: { count }});
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
  }
});

// Delete user (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await userService.deleteUser(req.params.id);
    res.send({data: message});
  } catch (error) {
    res.send({error: error.message});
  }
});

module.exports = router;