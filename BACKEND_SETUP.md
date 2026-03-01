# KalTrac Backend Setup Guide

## Prerequisites

- Node.js 18+
- Neon PostgreSQL account
- PostgreSQL client tools

## Setup Instructions

### 1. Database Setup

1. Create a new Neon project at https://console.neon.tech/
2. Get your connection string (DATABASE_URL)
3. Run the schema migration:
   ```bash
   psql DATABASE_URL < scripts/01-create-schema.sql
   ```

### 2. Backend Configuration

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your values:
   ```
   DATABASE_URL=postgresql://user:password@host/database
   JWT_SECRET=your-super-secret-key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

### 3. Start Backend Server

```bash
npm run dev
```

The API server will start on http://localhost:5000

### 4. Frontend Configuration

In `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000/api
VITE_DEEPSEEK_API_KEY=your_key_here
```

Then start frontend:
```bash
cd frontend
npm run dev
```

## Database Schema

### Tables

- **users**: User accounts with email and password
- **user_settings**: Custom nutrition goals and dietary restrictions
- **meals**: Food logs with nutrition data
- **workouts**: Exercise logs with calories burned
- **water_logs**: Daily water intake tracking
- **meal_favorites**: Saved favorite meals for quick access
- **meal_plans**: AI-generated meal plans

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Meals
- `POST /api/meals` - Add meal
- `GET /api/meals/today` - Get today's meals
- `GET /api/meals/range?startDate=&endDate=` - Get meals by date range
- `DELETE /api/meals/:id` - Delete meal

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Deployment

### To Vercel

1. Create vercel.json in root:
   ```json
   {
     "buildCommand": "npm install && npm run build",
     "outputDirectory": "frontend/dist"
   }
   ```

2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Troubleshooting

- If you get database connection errors, verify DATABASE_URL is correct
- If API calls fail, ensure CORS is properly configured (FRONTEND_URL matches your frontend URL)
- Check JWT_SECRET is set and consistent between restarts
