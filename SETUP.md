# Kaltrac Setup Guide

Quick setup instructions for running Kaltrac locally.

## Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## Installation Steps

### 1. Navigate to frontend directory
```bash
cd Kaltrac/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 4. Start development server
```bash
npm run dev
```

### 5. Open in browser
Navigate to `http://localhost:3000`

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
- Verify API key is correct
- Check API key has credits
- Ensure environment variable is set correctly

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (18+ required)

## Support

For issues, visit: https://github.com/brandonlacoste9-tech/Kaltrac/issues
