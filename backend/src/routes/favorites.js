import express from 'express';
import { query } from '../db.js';
import { authenticateRequest } from '../middleware.js';

const router = express.Router();

// Get all favorites
router.get('/', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      'SELECT * FROM meal_favorites WHERE user_id = $1 ORDER BY times_used DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Add favorite
router.post('/', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, calories, protein, carbs, fat, fiber } = req.body;
    
    const result = await query(
      `INSERT INTO meal_favorites (user_id, name, calories, protein, carbs, fat, fiber, times_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
       ON CONFLICT (user_id, name) DO UPDATE SET times_used = times_used + 1
       RETURNING *`,
      [userId, name, calories, protein, carbs, fat, fiber || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete favorite
router.delete('/:id', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favoriteId = req.params.id;
    
    const result = await query(
      'DELETE FROM meal_favorites WHERE id = $1 AND user_id = $2 RETURNING *',
      [favoriteId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    
    res.json({ message: 'Favorite deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
