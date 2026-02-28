# Kaltrac Setup Guide 🚀

Complete setup instructions for the Kaltrac AI Calorie Tracker.

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- Git (for cloning the repository)

---

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/brandonlacoste9-tech/Kaltrac.git
cd Kaltrac/frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 18.3.1
- React DOM 18.3.1
- Recharts (for charts and graphs)
- Vite (build tool)
- ESLint (code quality)

### 3. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit the `.env` file and add your Anthropic API key:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Where to get your API key:**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:3000`

---

## 🌍 Language Configuration

The app defaults to **French** (Quebec) but includes a language toggle button in the header.

To change the default language, edit `frontend/src/App.jsx`:

```javascript
const [language, setLanguage] = useState('fr'); // Change to 'en' for English
```

---

## 📦 Project Structure

```
Kaltrac/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app component (simple version)
│   │   ├── App-Enhanced.jsx     # Enhanced version with charts
│   │   ├── main.jsx             # React entry point
│   │   ├── constants.js         # App constants
│   │   ├── utils.js             # Utility functions
│   │   └── i18n/
│   │       └── translations.js  # Bilingual translations
│   ├── index.html               # HTML template
│   ├── package.json             # Dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── .env.example             # Environment variables template
│   └── .gitignore               # Git ignore rules
├── CONCEPT.md                   # Full concept document
├── README.md                    # Project overview
└── SETUP.md                     # This file
```

---

## 🎨 Two Versions Available

### Simple Version (App.jsx)
- Basic photo recognition
- Daily calorie tracking
- Meal logging
- Bilingual support
- Lightweight and fast

### Enhanced Version (App-Enhanced.jsx)
- Everything in simple version PLUS:
- Multi-page navigation (Today, History, Goals, Badges)
- Weekly calorie charts
- Macro pie charts
- Streak tracking
- Achievement badges
- AI meal suggestions
- Water intake tracking
- Goals customization
- Local storage persistence

To use the enhanced version, you need to install additional dependencies:

```bash
npm install recharts
```

Then update `main.jsx` to import the enhanced version:

```javascript
import App from './App-Enhanced.jsx'
```

---

## 🔑 API Key Security

**IMPORTANT:** Never commit your `.env` file to Git!

The `.gitignore` file already excludes:
- `.env`
- `.env.local`
- `.env.production`

Always use environment variables for sensitive data.

---

## 🚀 Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

To preview the production build:

```bash
npm run preview
```

---

## 🐛 Troubleshooting

### Issue: "Module not found: recharts"
**Solution:** Install recharts dependency
```bash
npm install recharts
```

### Issue: "API key not found"
**Solution:** Make sure your `.env` file exists and contains:
```
VITE_ANTHROPIC_API_KEY=your_key_here
```

### Issue: "Could not analyze image"
**Solution:** 
- Check your API key is valid
- Ensure you have internet connection
- Try a clearer photo with better lighting
- Make sure the image is in JPEG/PNG format

### Issue: Port 3000 already in use
**Solution:** Change the port in `vite.config.js`:
```javascript
server: {
  port: 3001, // Change to any available port
  host: true
}
```

---

## 📱 Mobile Development (Future)

The current version is a web app. For mobile (iOS/Android), we'll use React Native.

**Planned mobile features:**
- Native camera integration
- Push notifications
- Offline mode
- Barcode scanner
- Health app integration (Apple Health, Google Fit)

---

## 💰 API Costs

**Anthropic Claude API Pricing:**
- Claude Sonnet 4: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- Average cost per food photo analysis: ~$0.01-0.02
- 100 photo scans = ~$1-2

**Free tier:** Anthropic provides $5 free credits for new accounts.

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📧 Support

Issues? Questions? Contact:
- GitHub: [@brandonlacoste9-tech](https://github.com/brandonlacoste9-tech)
- Email: [your-email@example.com]

---

**Fait au Québec, pour le Québec** 🇨🇦
