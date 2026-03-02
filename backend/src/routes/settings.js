import express from 'express';
import { query } from '../db.js';
import { authenticateRequest } from '../middleware.js';

const router = express.Router();

// Get user settings
router.get('/', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      'SELECT * FROM settings WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.json({ 
        daily_calorie_goal: 2000, 
        daily_protein_goal: 150, 
        daily_carbs_goal: 250, 
        daily_fat_goal: 65,
        daily_water_goal: 8,
        language: 'en',
        dietary_restrictions: []
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update user settings
router.put('/', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal, daily_water_goal, dietary_restrictions, language } = req.body;
    
    const result = await query(
      `INSERT INTO settings (user_id, daily_calorie_goal, daily_protein_goal, daily_carbs_goal, daily_fat_goal, daily_water_goal, dietary_restrictions, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET 
       daily_calorie_goal = $2, 
       daily_protein_goal = $3, 
       daily_carbs_goal = $4, 
       daily_fat_goal = $5, 
       daily_water_goal = $6,
       dietary_restrictions = $7,
       language = $8
       RETURNING *`,
      [
        userId, 
        daily_calorie_goal, 
        daily_protein_goal, 
        daily_carbs_goal, 
        daily_fat_goal, 
        daily_water_goal || 8,
        dietary_restrictions || '{}',
        language || 'en'
      ]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
