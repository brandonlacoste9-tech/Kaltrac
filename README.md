# Kaltrac 📸🍎

**Prenez une photo, connaissez vos calories** | **Snap a photo, know your calories**

AI-powered calorie tracker with bilingual support (Quebec French + English)

---

## 🌟 Features

- 📷 **Photo Recognition** - Take a photo of your food, AI identifies it instantly
- 🔢 **Instant Calorie Count** - Get calories, protein, carbs, and fat breakdown
- 📊 **Daily Tracking** - Track your meals and progress throughout the day
- 🌍 **Bilingual** - Full support for Quebec French and English
- 🎨 **Beautiful Design** - Dark theme with smooth animations
- 🤖 **AI (Local-first)** - Uses **Gemini Flash** when configured, otherwise falls back to **Ollama** (local) and then sample/manual data

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Optional: **Gemini API key** (`GEMINI_API_KEY`) for best AI results
- Optional: **Ollama** running locally for free offline AI (`OLLAMA_URL`, defaults to `http://localhost:11434/api/chat`)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/brandonlacoste9-tech/Kaltrac.git
cd Kaltrac
```

2. **Install dependencies**
```bash
cd backend && npm install
cd ../frontend && npm install
```

3. **Set up environment variables**
```bash
# backend
cd ../backend
cp .env.example .env

# frontend
cd ../frontend
cp .env.example .env.local
```

4. **Start dev servers**
```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

---

## 🎯 How to Use

1. **Take a photo** - Click the camera button or drag & drop a food image
2. **AI analyzes** - Gemini Flash (or Ollama) identifies the food and calculates nutrition
3. **Review results** - See calories, protein, carbs, and fat
4. **Add to log** - Save to your daily meal log
5. **Track progress** - Monitor your daily calorie goal

---

## 🌍 Language Support

The app defaults to **French** (for Quebec market) but includes a language toggle in the header.

**Supported languages:**
- 🇨🇦 Français (Québec)
- 🇬🇧 English

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **AI:** Gemini Flash (optional) + Ollama (local fallback)
- **Styling:** CSS-in-JS (inline styles)
- **Fonts:** Fraunces (serif) + DM Mono (monospace)

---

## 📱 Future Features

- [ ] React Native mobile app (iOS + Android)
- [ ] Backend API (NestJS + PostgreSQL)
- [ ] User authentication
- [ ] Premium features (unlimited scans, meal planning)
- [ ] Barcode scanner
- [ ] Food database with Quebec-specific foods
- [ ] Weekly analytics and reports
- [ ] Social features (share meals, challenges)

---

## 💰 Business Model

**Freemium:**
- Free: 3 photo scans per day
- Premium: $9.99 CAD/month (unlimited scans + advanced features)

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

---

## 📧 Contact

Brandon Lacoste - [@brandonlacoste9-tech](https://github.com/brandonlacoste9-tech)

---

**Fait au Québec, pour le Québec** 🇨🇦