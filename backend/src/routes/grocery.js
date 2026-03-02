import express from 'express';
import { query } from '../db.js';

const router = express.Router();

// Get from cache
router.get('/cache/:barcode', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM grocery_scan_cache WHERE barcode = $1',
      [req.params.barcode]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cache miss' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update/Set cache
router.post('/cache', async (req, res, next) => {
  try {
    const { barcode, productData } = req.body;

    const result = await query(
      `INSERT INTO grocery_scan_cache (barcode, product_data, cached_at) 
       VALUES ($1, $2, NOW())
       ON CONFLICT (barcode) 
       DO UPDATE SET product_data = $2, cached_at = NOW()
       RETURNING *`,
      [barcode, JSON.stringify(productData)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
