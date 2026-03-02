import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import axios from 'axios';
import { errorHandler } from './middleware.js';

import authRoutes from './routes/auth.js';
import mealsRoutes from './routes/meals.js';
import settingsRoutes from './routes/settings.js';
import favoritesRoutes from './routes/favorites.js';
import workoutsRoutes from './routes/workouts.js';
import waterRoutes from './routes/water.js';
import aiRoutes from './routes/ai.js';
import shoppingListRoutes from './routes/shopping_list.js';
import groceryRoutes from './routes/grocery.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increase limit for photo uploads

// Health check
app.get('/health', async (req, res) => {
  let ollamaStatus = false;
  try {
    const ollamaBase = (process.env.OLLAMA_URL || 'http://localhost:11434/api/chat').replace('/api/chat', '');
    await axios.get(ollamaBase, { timeout: 2000 });
    ollamaStatus = true;
  } catch { /* Ollama not running */ }

  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    ollama: ollamaStatus,
    database: 'auto-detect (PostgreSQL → JSON fallback)',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/grocery', groceryRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Export for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    console.log(`\n⚜ KalTrac 2.0 API — Luxury Leather Edition`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    
    // Check Ollama
    try {
      const ollamaBase = (process.env.OLLAMA_URL || 'http://localhost:11434/api/chat').replace('/api/chat', '');
      await axios.get(ollamaBase, { timeout: 3000 });
      console.log(`✅ Ollama AI connected at ${ollamaBase}`);
    } catch {
      console.log(`⚠️  Ollama not detected — AI features will use sample data`);
      console.log(`   Start Ollama with: ollama serve`);
    }
    
    console.log(`\n📁 Database: auto-detect (PostgreSQL → local JSON fallback)`);
    console.log(`✨ Ready!\n`);
  });
}

