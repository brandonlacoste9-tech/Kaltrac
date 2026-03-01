import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware.js';
import authRoutes from './routes/auth.js';
import mealsRoutes from './routes/meals.js';
import settingsRoutes from './routes/settings.js';
import favoritesRoutes from './routes/favorites.js';
import workoutsRoutes from './routes/workouts.js';
import waterRoutes from './routes/water.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/water', waterRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`KalTrac API server running on port ${PORT}`);
});
