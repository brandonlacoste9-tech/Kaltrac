import express from 'express';
import { query } from '../db.js';
import { authenticateRequest } from '../middleware.js';

const router = express.Router();

// Add water log
router.post('/', authenticateRequest, async (req, res, next) => {
  try {
    const { amount_ml, notes } = req.body;
    const userId = req.user.id;
    
    const result = await query(
      `INSERT INTO water_logs (user_id, amount_ml, notes, logged_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, amount_ml, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get water logs for today
router.get('/today', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      `SELECT * FROM water_logs 
       WHERE user_id = $1 AND DATE(logged_at) = CURRENT_DATE
       ORDER BY logged_at DESC`,
      [userId]
    );
    
    const totalMl = result.rows.reduce((sum, log) => sum + log.amount_ml, 0);
    res.json({ logs: result.rows, totalMl });
  } catch (error) {
    next(error);
  }
});

// Get water logs for date range
router.get('/range', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const result = await query(
      `SELECT * FROM water_logs 
       WHERE user_id = $1 AND logged_at::date BETWEEN $2 AND $3
       ORDER BY logged_at DESC`,
      [userId, startDate, endDate]
    );
    
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Delete water log
router.delete('/:id', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const logId = req.params.id;
    
    const result = await query(
      'DELETE FROM water_logs WHERE id = $1 AND user_id = $2 RETURNING *',
      [logId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Water log not found' });
    }
    
    res.json({ message: 'Water log deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
