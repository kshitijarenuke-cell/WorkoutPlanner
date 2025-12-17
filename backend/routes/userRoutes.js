const express = require('express');
const router = express.Router();
// 1. IMPORT updateUserProfile
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const { registerUser, loginUser, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post('/', registerUser);
router.post('/login', loginUser);

// 2. ADD THIS MISSING LINE:
router.put('/profile', protect, updateUserProfile);

// GET current user profile (used by frontend to refresh stored user on app start)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnboarded: user.isOnboarded,
      age: user.age,
      goal: user.goal,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});


// Basic Register (Keep this)
router.post('/', async (req, res) => { /* ... existing code ... */ });
// Basic Login (Keep this)
router.post('/login', async (req, res) => { /* ... existing code ... */ });

router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // 2. Get user info from the payload
    const { name, email, sub } = ticket.getPayload(); // 'sub' is Google's unique user ID

    // 3. Check if user already exists in OUR database
    let user = await User.findOne({ email });

    let isNewUser = false;
    if (!user) {
      // 4. If not, create a new user automatically
      // We generate a random password since they will login with Google
      const randomPassword = Math.random().toString(36).slice(-8); 
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      isNewUser = true;
    }

    // 5. Generate OUR App Token (JWT)
    // This is the same token logic as your normal login
    const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // 6. Send back the user and token (include onboarding flag so frontend can route correctly)
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnboarded: user.isOnboarded,
      token: appToken,

      age: user.age,
      goal: user.goal,
      isNewUser,
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(400).json({ message: "Google authentication failed" });
  }
});



module.exports = router;