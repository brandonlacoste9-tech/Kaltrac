import express from 'express';
import { query } from '../db.js';
import { authenticateRequest } from '../middleware.js';

const router = express.Router();

// Add workout
router.post('/', authenticateRequest, async (req, res, next) => {
  try {
    const { exercise_name, duration_minutes, calories_burned, intensity, notes } = req.body;
    const userId = req.user.id;
    
    const result = await query(
      `INSERT INTO workouts (user_id, exercise_name, duration_minutes, calories_burned, intensity, notes, logged_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [userId, exercise_name, duration_minutes, calories_burned, intensity || 'moderate', notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get workouts for today
router.get('/today', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      `SELECT * FROM workouts 
       WHERE user_id = $1 AND DATE(logged_at) = CURRENT_DATE
       ORDER BY logged_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get workouts for date range
router.get('/range', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const result = await query(
      `SELECT * FROM workouts 
       WHERE user_id = $1 AND logged_at::date BETWEEN $2 AND $3
       ORDER BY logged_at DESC`,
      [userId, startDate, endDate]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Delete workout
router.delete('/:id', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workoutId = req.params.id;
    
    const result = await query(
      'DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING *',
      [workoutId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
