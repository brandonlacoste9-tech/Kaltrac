# Kaltrac Setup Guide

Quick setup instructions for running Kaltrac locally.

## Prerequisites

- Node.js 18+ and npm
- Optional: **Gemini API key** (`GEMINI_API_KEY`) for best AI results
- Optional: **Ollama** running locally for free offline AI (`OLLAMA_URL`, defaults to `http://localhost:11434/api/chat`)

## Installation Steps

### 1. Navigate to frontend directory
```bash
cd Kaltrac
```

### 2. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Set up environment variables
```bash
# backend
cd ../backend
cp .env.example .env

# frontend
cd ../frontend
cp .env.example .env.local
```

### 4. Start development servers
```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

### 5. Open in browser
Navigate to `http://localhost:5173`

## Build for Production

```bash
npm run build
```

The production build will be in `frontend/dist/`

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Set build directory to `frontend`
4. Add environment variable: `VITE_ANTHROPIC_API_KEY`
5. Deploy

### Netlify
1. Build command: `cd frontend && npm install && npm run build`
2. Publish directory: `frontend/dist`
3. Add environment variable: `VITE_ANTHROPIC_API_KEY`

## Troubleshooting

### Camera not working
- Ensure HTTPS (required for camera access)
- Check browser permissions
- Try different browser (Chrome/Edge recommended)

### API errors
- If using Gemini, verify `GEMINI_API_KEY` is set in `backend/.env`
- If using Ollama, ensure it’s running (`ollama serve`) and reachable at `OLLAMA_URL`

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (18+ required)

## Support

For issues, visit: https://github.com/brandonlacoste9-tech/Kaltrac/issues
