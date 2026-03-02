import express from 'express';
import { query } from '../db.js';
import { authenticateRequest } from '../middleware.js';

const router = express.Router();

// Get shopping list
router.get('/', authenticateRequest, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM shopping_list WHERE user_id = $1 ORDER BY added_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Add to shopping list
router.post('/', authenticateRequest, async (req, res, next) => {
  try {
    const { 
      barcode, product_name, brand, image_url, 
      calories_per_serving, nutriscore_grade, nova_group 
    } = req.body;

    const result = await query(
      `INSERT INTO shopping_list (
        user_id, barcode, product_name, brand, image_url, 
        calories_per_serving, nutriscore_grade, nova_group
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        req.user.id, barcode, product_name, brand, image_url, 
        calories_per_serving, nutriscore_grade, nova_group
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Toggle checked status
router.patch('/:id', authenticateRequest, async (req, res, next) => {
  try {
    const { is_checked } = req.body;
    const result = await query(
      'UPDATE shopping_list SET is_checked = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [is_checked, req.params.id, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete from list
router.delete('/:id', authenticateRequest, async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM shopping_list WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

// Clear completed
router.delete('/completed', authenticateRequest, async (req, res, next) => {
  try {
    await query(
      'DELETE FROM shopping_list WHERE user_id = $1 AND is_checked = TRUE',
      [req.user.id]
    );
    res.json({ message: 'Cleared completed items' });
  } catch (error) {
    next(error);
  }
});

export default router;
