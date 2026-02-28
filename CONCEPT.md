# Kaltrac - AI Calorie Tracker 📸🍎

**Tagline FR:** Prenez une photo, connaissez vos calories  
**Tagline EN:** Snap a photo, know your calories

---

## 🎯 CONCEPT

**What:** AI-powered calorie tracker that analyzes food photos  
**How:** Take a photo of your meal → AI identifies food → Instant calorie count  
**Why:** Easier than manual entry, more accurate, faster

---

## 🌟 KEY FEATURES

### Core Features

1. **Photo Recognition**
   - Take photo of food
   - AI identifies ingredients
   - Estimates portion sizes
   - Calculates calories automatically

2. **Daily Tracking**
   - Breakfast, lunch, dinner, snacks
   - Daily calorie goal
   - Progress visualization
   - Streak tracking

3. **Food Database**
   - 100,000+ foods
   - Quebec-specific foods (poutine, tourtière, etc.)
   - Restaurant meals
   - Packaged foods (barcode scanner)

4. **Nutrition Breakdown**
   - Calories
   - Protein, carbs, fat
   - Fiber, sugar, sodium
   - Vitamins & minerals

5. **Goals & Progress**
   - Weight loss/gain/maintain
   - Custom calorie goals
   - Macro targets
   - Weekly reports

### Premium Features

6. **Meal Planning**
   - AI-generated meal plans
   - Recipe suggestions
   - Shopping lists
   - Prep instructions

7. **Advanced Analytics**
   - Trends over time
   - Nutrient deficiencies
   - Meal timing analysis
   - Export data (CSV, PDF)

8. **Social Features**
   - Share meals
   - Follow friends
   - Challenges
   - Leaderboards

---

## 🎨 DESIGN

### Brand Identity

**Name:** Kaltrac (Calorie + Track)  
**Colors:**
- Primary: #10B981 (Green - healthy)
- Secondary: #3B82F6 (Blue - trust)
- Accent: #F59E0B (Orange - energy)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444

**Logo:** Camera icon + apple icon combined

**Vibe:** Modern, clean, friendly, motivating

### UI/UX

**Home Screen:**
- Daily calorie progress (circular chart)
- Quick "Add Meal" camera button (prominent)
- Today's meals (breakfast, lunch, dinner, snacks)
- Water intake tracker
- Streak counter

**Camera Flow:**
1. Tap camera button
2. Take photo or choose from gallery
3. AI analyzes (2-3 seconds)
4. Shows identified foods with calories
5. Edit if needed
6. Confirm and save

**Food Detail:**
- Food name
- Photo
- Calories (large, prominent)
- Macros (protein, carbs, fat)
- Portion size
- Edit button
- Delete button

---

## 🤖 AI TECHNOLOGY

### Food Recognition

**Model:** OpenAI GPT-4 Vision or Google Gemini Vision

**Prompt:**
```
Analyze this food image and identify:
1. All food items visible
2. Estimated portion sizes
3. Calorie count for each item
4. Macronutrients (protein, carbs, fat)

Return as JSON:
{
  "foods": [
    {
      "name": "Grilled chicken breast",
      "portion": "150g",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6
    }
  ],
  "total_calories": 165,
  "confidence": 0.95
}
```

**Accuracy:**
- 85-95% for common foods
- Lower for mixed dishes
- User can correct if wrong

### Fallback Options

If AI can't identify:
1. Manual search (food database)
2. Barcode scanner
3. Manual entry

---

## 📱 TECH STACK

### Frontend (Mobile App)

**Framework:** React Native (iOS + Android)

**Libraries:**
- React Navigation (routing)
- React Native Camera (photo capture)
- React Native Vision Camera (better camera)
- React Native Chart Kit (graphs)
- AsyncStorage (local data)
- React Query (API calls)
- Zustand (state management)

### Backend

**Framework:** Node.js + Express or NestJS

**Database:** PostgreSQL + Prisma

**AI:** OpenAI GPT-4 Vision API or Google Gemini

**Storage:** AWS S3 or Cloudflare R2 (food photos)

**Auth:** JWT + bcrypt

### Infrastructure

**Hosting:**
- Backend: Railway (free tier)
- Database: Supabase (free tier)
- Storage: Cloudflare R2 (free tier)
- CDN: Cloudflare (free)

**Cost:** $0/month (free tiers)

---

## 💰 BUSINESS MODEL

### Freemium Model

**Free Tier:**
- 3 photo scans per day
- Basic tracking
- 7-day history
- Basic analytics

**Premium ($9.99 CAD/month or $79.99/year):**
- Unlimited photo scans
- Meal planning
- Advanced analytics
- Export data
- No ads
- Priority support

**Target:**
- 10,000 free users
- 1,000 premium users (10% conversion)
- Revenue: $9,990/month = $119,880/year

---

## 🎯 TARGET AUDIENCE

### Primary

**Health-conscious millennials (25-40)**
- Want to lose weight or maintain
- Busy lifestyle
- Tech-savvy
- Willing to pay for convenience

### Secondary

**Fitness enthusiasts**
- Track macros for muscle gain
- Athletes
- Bodybuilders
- CrossFit community

**People with dietary restrictions**
- Diabetes
- Food allergies
- Specific diets (keto, vegan, etc.)

---

## 🚀 MVP FEATURES (Launch in 4 Weeks)

### Week 1: Core Setup
- [ ] Project setup (React Native + Expo)
- [ ] Backend setup (NestJS + Prisma)
- [ ] Database schema
- [ ] Authentication (signup/login)
- [ ] Basic UI (home screen, navigation)

### Week 2: Photo Recognition
- [ ] Camera integration
- [ ] Photo upload
- [ ] OpenAI Vision API integration
- [ ] Food identification
- [ ] Calorie calculation

### Week 3: Tracking & Analytics
- [ ] Daily meal log
- [ ] Calorie goal setting
- [ ] Progress charts
- [ ] Food database
- [ ] Manual food entry

### Week 4: Polish & Launch
- [ ] UI/UX polish
- [ ] Onboarding flow
- [ ] Settings page
- [ ] Profile page
- [ ] App store submission

---

## 📊 DATABASE SCHEMA

### Users
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  age           Int?
  gender        String?
  height        Float?   // cm
  weight        Float?   // kg
  goalWeight    Float?   // kg
  activityLevel String?  // sedentary, light, moderate, active, very_active
  calorieGoal   Int?     // daily calorie goal
  isPremium     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  meals         Meal[]
  waterLogs     WaterLog[]
}
```

### Meals
```prisma
model Meal {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // breakfast, lunch, dinner, snack
  photoUrl    String?
  totalCalories Int
  totalProtein  Float
  totalCarbs    Float
  totalFat      Float
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
  
  foods       Food[]
}
```

### Foods
```prisma
model Food {
  id          String  @id @default(uuid())
  mealId      String
  meal        Meal    @relation(fields: [mealId], references: [id])
  name        String
  portion     String
  calories    Int
  protein     Float
  carbs       Float
  fat         Float
  fiber       Float?
  sugar       Float?
  sodium      Float?
}
```

### WaterLog
```prisma
model WaterLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  amount    Int      // ml
  date      DateTime @default(now())
}
```

---

## 🎨 SCREENS

### 1. Onboarding (First Time)
- Welcome screen
- Sign up / Log in
- Goal selection (lose, gain, maintain)
- Personal info (age, gender, height, weight)
- Activity level
- Calculate calorie goal
- Enable notifications

### 2. Home Screen
- Header: Date, streak, settings icon
- Calorie progress (circular chart)
  - Consumed / Goal
  - Remaining
- Quick actions:
  - Camera button (large, center)
  - Add meal manually
  - Add water
- Today's meals:
  - Breakfast (photo, calories)
  - Lunch (photo, calories)
  - Dinner (photo, calories)
  - Snacks (photo, calories)
- Bottom nav: Home, History, Stats, Profile

### 3. Camera Screen
- Camera view (full screen)
- Capture button (center bottom)
- Gallery button (bottom left)
- Flash toggle (top right)
- Cancel button (top left)

### 4. Food Recognition Screen
- Photo preview (top)
- Loading spinner: "Analyzing your meal..."
- Results:
  - Identified foods (list)
  - Each food: name, portion, calories
  - Total calories (large)
- Edit button (if wrong)
- Confirm button (save)

### 5. History Screen
- Calendar view
- Select date
- Meals for that day
- Daily totals
- Weekly summary

### 6. Stats Screen
- Weekly chart (calories)
- Monthly chart (weight)
- Macros breakdown (pie chart)
- Streak counter
- Achievements/badges

### 7. Profile Screen
- User info
- Goals
- Settings
- Upgrade to Premium
- Log out

---

## 🌍 BILINGUAL (FR/EN)

### Language Detection
- Auto-detect device language
- Default: French (Quebec market)
- Manual toggle in settings

### Key Translations

**FR:**
- Accueil (Home)
- Historique (History)
- Statistiques (Stats)
- Profil (Profile)
- Prendre une photo (Take a photo)
- Ajouter un repas (Add meal)
- Calories consommées (Calories consumed)
- Objectif quotidien (Daily goal)
- Petit-déjeuner (Breakfast)
- Dîner (Lunch)
- Souper (Dinner)
- Collation (Snack)

**EN:**
- Home
- History
- Stats
- Profile
- Take a photo
- Add meal
- Calories consumed
- Daily goal
- Breakfast
- Lunch
- Dinner
- Snack

---

## 🚀 LAUNCH STRATEGY

### Beta Launch (Month 1)

**Target:** 100 beta users

**Offer:**
- Free premium for 3 months
- Beta tester badge
- Direct feedback channel

**Recruitment:**
- Reddit (r/loseit, r/fitness, r/Quebec)
- Facebook groups (fitness, weight loss)
- Instagram fitness influencers
- Friends/family

### Public Launch (Month 2)

**App Stores:**
- iOS App Store
- Google Play Store

**Marketing:**
- Product Hunt launch
- Reddit posts
- Instagram ads ($500)
- Facebook ads ($500)
- Influencer partnerships (5-10 micro-influencers)

**Goal:**
- 1,000 downloads in first month
- 100 premium subscribers (10% conversion)
- 4.5+ star rating

---

## 💡 UNIQUE SELLING POINTS

### vs MyFitnessPal
- ✅ AI photo recognition (they don't have this)
- ✅ Faster (no manual entry)
- ✅ Quebec-focused (poutine, tourtière, etc.)
- ✅ Bilingual (FR/EN)
- ✅ Simpler UI

### vs Lose It
- ✅ Better AI (GPT-4 Vision)
- ✅ Quebec market focus
- ✅ Cheaper premium ($9.99 vs $19.99)

### vs Yazio
- ✅ More accurate photo recognition
- ✅ Quebec-specific foods
- ✅ Better design

---

## 📈 GROWTH STRATEGY

### Month 1-3: Product-Market Fit
- Launch MVP
- Get 1,000 users
- Collect feedback
- Iterate quickly
- Achieve 4.5+ star rating

### Month 4-6: Growth
- Paid ads ($2,000/month)
- Influencer partnerships
- Content marketing (blog, YouTube)
- SEO optimization
- Target: 10,000 users

### Month 7-12: Scale
- Expand to Canada-wide
- Add more features (meal planning, recipes)
- B2B (gyms, nutritionists)
- Target: 50,000 users, 5,000 premium

---

## 💰 FINANCIAL PROJECTIONS

### Year 1

**Month 1 (Beta):**
- Users: 100
- Revenue: $0
- Cost: $0 (free tiers)

**Month 3:**
- Users: 1,000
- Premium: 100 (10%)
- Revenue: $999/month
- Cost: $50 (hosting)
- Profit: $949/month

**Month 6:**
- Users: 10,000
- Premium: 1,000 (10%)
- Revenue: $9,990/month
- Cost: $500 (hosting, AI API)
- Profit: $9,490/month

**Month 12:**
- Users: 50,000
- Premium: 5,000 (10%)
- Revenue: $49,950/month
- Cost: $5,000 (hosting, AI API, support)
- Profit: $44,950/month

**Year 1 Total:**
- Revenue: $300,000
- Profit: $250,000

---

## ✅ SUCCESS METRICS

### Product
- [ ] 4.5+ star rating (App Store + Google Play)
- [ ] 85%+ AI accuracy
- [ ] < 3 second photo analysis
- [ ] < 1% crash rate

### Business
- [ ] 10,000 users by Month 6
- [ ] 10% free-to-premium conversion
- [ ] $10,000/month revenue by Month 6
- [ ] 50% month-over-month growth

### User Engagement
- [ ] 60%+ daily active users
- [ ] 3+ meals logged per day
- [ ] 30-day retention: 40%+
- [ ] 90-day retention: 20%+

---

## 🎯 NEXT STEPS

1. **This Week:**
   - Set up React Native project
   - Set up backend (NestJS + Prisma)
   - Design database schema
   - Create wireframes

2. **Next Week:**
   - Build authentication
   - Integrate camera
   - Connect OpenAI Vision API
   - Test food recognition

3. **Week 3:**
   - Build meal logging
   - Build analytics
   - Build profile/settings
   - Polish UI

4. **Week 4:**
   - Beta testing
   - Bug fixes
   - App store submission
   - Launch! 🚀

---

**Let's build Kaltrac and help people eat healthier! 🍎📸**

**Fait au Québec, pour le Québec** 🇨🇦
