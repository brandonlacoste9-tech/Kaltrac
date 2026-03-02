# KalTrac 2.0 — Architecture & Refactoring

## Modular Monolith

The application has been reconstructed into a robust, full-stack monorepo designed for high-end performance and scalability.

### Backend (Node.js/Express)

- **Database**: Dual-layer persistence with Neon PostgreSQL (Production) and local JSON (Development fallback).
- **AI Engine**: Advanced vision processing via Gemini 2.0 Flash.
- **Local AI**: Seamless integration with Ollama for users preferring local data processing.
- **Auth**: JWT-based secure authentication system.

### Frontend (React/Vite)

- **V2 Components**: Reimagined `components/v2/` library following the "Luxury Leather" design system.
- **State Management**: Scalable `useCalorieTracker` hook architecture.
- **Translations**: Integrated i18n support for French and English.
- **Services**: Clean axios-based communication layer with automatic token handling.

### Deployment (Vercel)

- **Unified Logic**: Root `vercel.json` manages the frontend build and backend serverless functions.
- **Production Zero-Config**: Automated environment switching for easy staging.

## Next Steps for Deployment

1.  **Set Environment Variables** in Vercel:
    - `DATABASE_URL` (From Neon Console)
    - `GEMINI_API_KEY` (From Google AI Studio)
    - `JWT_SECRET` (A strong random string)
2.  **Run Migrations**: Use the provided `scripts/01-create-schema.sql` to initialize your Neon database.
3.  **Production Verify**: Visit your Vercel URL to confirm the scanner and AI features are live.
