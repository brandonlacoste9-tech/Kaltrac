import express from 'express';
import { query } from '../db.js';
import { authenticateRequest } from '../middleware.js';

const router = express.Router();

// Add meal
router.post('/', authenticateRequest, async (req, res, next) => {
  try {
    const { name, calories, protein, carbs, fat, fiber, meal_type, notes } = req.body;
    const userId = req.user.id;
    
    const result = await query(
      `INSERT INTO meals (user_id, name, calories, protein, carbs, fat, fiber, meal_type, notes, logged_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [userId, name, calories, protein, carbs, fat, fiber, meal_type, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get meals for today
router.get('/today', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      `SELECT * FROM meals 
       WHERE user_id = $1 AND DATE(logged_at) = CURRENT_DATE
       ORDER BY logged_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get meals for date range
router.get('/range', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const result = await query(
      `SELECT * FROM meals 
       WHERE user_id = $1 AND logged_at::date BETWEEN $2 AND $3
       ORDER BY logged_at DESC`,
      [userId, startDate, endDate]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Delete meal
router.delete('/:id', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const mealId = req.params.id;
    
    const result = await query(
      'DELETE FROM meals WHERE id = $1 AND user_id = $2 RETURNING *',
      [mealId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    res.json({ message: 'Meal deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
