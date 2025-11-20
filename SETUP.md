# 🚀 Nutri-Genie Quick Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Gemini API Key from https://ai.google.dev/

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```
✅ **Status**: Completed

### 2. Configure Environment Variables
Edit the `.env` file and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Get your API key**: Visit https://ai.google.dev/ → API → Get API Key

### 3. Start MongoDB

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - MongoDB Atlas:**
Update `MONGODB_URI` in `.env` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrigenie
```

### 4. Start the Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### 5. Open in Browser
Navigate to: **http://localhost:3000**

---

## 🎯 How to Use Nutri-Genie

1. **Visit Home Page** → Click "Get Started"
2. **Sign Up** → Create account with email/password
3. **Enter Health Data** → Age, weight, height, activity level, goals
4. **Get AI Plan** → Receive personalized meal and workout plans
5. **View Dashboard** → Track your health history and progress

---

## 📁 Project Structure

```
Nutri-Genie/
├── server.js           # Express server + AI integration
├── package.json        # Dependencies
├── .env               # Environment variables (add your API key here!)
├── views/             # EJS templates
│   ├── home.ejs       # Landing page
│   ├── login.ejs      # Authentication
│   ├── index.ejs      # Data input form
│   ├── result.ejs     # AI results
│   └── dashboard.ejs  # User history
└── public/            # Static assets (CSS, JS, images)
```

---

## 🔧 Troubleshooting

**Problem**: "GEMINI_API_KEY not found"
- **Solution**: Add your API key to the `.env` file

**Problem**: "MongoDB connection error"
- **Solution**: Make sure MongoDB is running (local) or check your Atlas URI

**Problem**: Port 3000 already in use
- **Solution**: Change `PORT=3000` to another port in `.env`

---

## 🤖 AI Features

- **Gemini 2.5 Flash** generates personalized:
  - Meal plans with calorie breakdown
  - Workout routines with sets/reps
  - Allergy-safe recommendations
  - Goal-specific nutrition advice

---

## 📊 Database Schema

**Users Collection:**
- email, password, name, createdAt

**HealthData Collection:**
- userId, age, weight, height, gender
- activityLevel, goalType, allergies
- bmr, tdee, targetCalories
- mealPlan (AI-generated)
- workoutPlan (AI-generated)
- createdAt

---

## 🎨 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **AI**: Google Gemini 2.5 Flash
- **Frontend**: EJS templates
- **Styling**: Tailwind CSS
- **Session**: express-session

---

## 📝 Next Steps

To make Nutri-Genie production-ready:

1. **Hash passwords** using bcrypt
2. **Add email verification**
3. **Implement password reset**
4. **Add input validation** on server side
5. **Rate limit API calls**
6. **Deploy to cloud** (Heroku, Vercel, Railway)
7. **Add analytics** for tracking usage

---

**Need help?** Check the README.md for detailed documentation!
