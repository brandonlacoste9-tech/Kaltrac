import express from 'express';
import { createUser, authenticateUser, generateToken, getUserById } from '../auth.js';
import { authenticateRequest } from '../middleware.js';

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, promoCode } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Strict Promo Code Validation
    const OFFICIAL_CODE = 'KALTRAC-VIP-2026';
    const submittedCode = (promoCode || '').trim().toUpperCase();
    
    if (submittedCode !== OFFICIAL_CODE) {
      return res.status(403).json({ error: 'Access restricted to VIP members only. Invalid secret key.' });
    }

    console.log(`VIP Access Granted: User ${email}`);

    
    const user = await createUser(email, password, name);


    const token = generateToken(user.id);
    
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = generateToken(user.id);
    
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticateRequest, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
