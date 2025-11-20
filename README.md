# Nutri-Genie 🧞‍♂️

> An AI-powered Personal Health Consultant that provides instant metabolic analysis, hyper-personalized meal plans, workout routines, and persistent health tracking.

## 🚀 Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (NoSQL)
- **Frontend**: EJS (Embedded JavaScript Templates)
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini 1.5 Flash
- **Version Control**: Git/GitHub

---

## 📁 Project Structure

```
Nutri-Genie/
├── node_modules/          # Dependencies (auto-generated, not tracked in Git)
├── public/                # Static assets served directly to the browser
├── views/                 # EJS templates for dynamic HTML rendering
│   ├── home.ejs          # Landing/Marketing page
│   ├── login.ejs         # User authentication view
│   ├── index.ejs         # Health data input form
│   ├── result.ejs        # AI-generated recommendations display
│   └── dashboard.ejs     # User progress dashboard & history
├── .env                   # Environment variables (API keys, secrets)
├── .gitignore            # Files/folders to exclude from Git
├── package.json          # Project metadata & dependencies
├── README.md             # This file - project documentation
└── server.js             # Main application entry point
```

---

## 📂 Folder & File Breakdown

### `node_modules/`
**Purpose**: Contains all installed npm packages and dependencies.

- Auto-generated when you run `npm install`
- **Never commit this to Git** (listed in `.gitignore`)
- Size can be very large (100+ MB)

**Common packages in this project**:
- `express` - Web framework
- `ejs` - Templating engine
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable loader
- `@google/generative-ai` - Gemini AI SDK

---

### `public/`
**Purpose**: Stores static files that are served directly to the client without processing.

**Typical contents**:
```
public/
├── css/
│   └── styles.css        # Custom CSS (if not using inline Tailwind)
├── images/
│   ├── logo.png
│   └── hero-bg.jpg
└── js/
    └── client.js         # Client-side JavaScript
```

**How it works**:
```javascript
// In server.js
app.use(express.static('public'));
```

**Access in browser**:
- File: `public/images/logo.png`
- URL: `http://localhost:3000/images/logo.png`

**Best practices**:
- ✅ Store images, CSS, client-side JS, fonts here
- ✅ Keep files optimized (compress images, minify CSS/JS)
- ❌ Don't store sensitive data here (everything is publicly accessible)

---

### `views/`
**Purpose**: Contains EJS templates that generate dynamic HTML pages.

#### **Template Breakdown**

| File | Purpose | User Flow Position |
|------|---------|-------------------|
| **home.ejs** | Marketing landing page with features, CTA | Entry point |
| **login.ejs** | User authentication (login/signup) | After CTA click |
| **index.ejs** | Health data input form (age, weight, goals, allergies) | After login |
| **result.ejs** | Displays AI-generated meal plans & workouts | After form submit |
| **dashboard.ejs** | Shows user history, progress charts, saved plans | Navigation from result |

#### **How EJS Templates Work**

EJS lets you embed JavaScript in HTML to create dynamic content:

**Example - Rendering user data in `result.ejs`:**
```html
<!-- EJS Template Syntax -->
<h1>Welcome, <%= userName %>!</h1>

<p>Your BMR: <%= bmr %> calories</p>
<p>Your TDEE: <%= tdee %> calories</p>

<!-- Loop through meal suggestions -->
<ul>
  <% meals.forEach(meal => { %>
    <li><%= meal.name %> - <%= meal.calories %> cal</li>
  <% }) %>
</ul>
```

**Server-side rendering (in server.js):**
```javascript
app.get('/result', (req, res) => {
  res.render('result', {
    userName: 'John',
    bmr: 1650,
    tdee: 2200,
    meals: [
      { name: 'Grilled Chicken Salad', calories: 450 },
      { name: 'Quinoa Bowl', calories: 380 }
    ]
  });
});
```

**EJS Syntax Reference**:
- `<%= variable %>` - Output escaped value (safe HTML)
- `<%- variable %>` - Output unescaped value (raw HTML)
- `<% code %>` - Execute JavaScript (loops, conditionals)
- `<%# comment %>` - EJS comment (not rendered)

---

### `.env`
**Purpose**: Stores sensitive environment variables and configuration.

**Example `.env` file:**
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/nutrigenie
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/nutrigenie

# Google Gemini API Key
GEMINI_API_KEY=AIza...your_actual_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (for authentication)
SESSION_SECRET=your_super_secret_random_string_here
```

**How to use in code:**
```javascript
// server.js - Load at the very top
require('dotenv').config();

// Access variables
const apiKey = process.env.GEMINI_API_KEY;
const port = process.env.PORT || 3000;
```

**🔒 Security Best Practices**:
- ✅ **Never commit `.env` to Git** (add to `.gitignore`)
- ✅ Use different `.env` files for development/production
- ✅ Keep API keys and secrets here only
- ✅ Create a `.env.example` file with dummy values for documentation
- ✅ Rotate keys if accidentally exposed

**Example `.env.example` (safe to commit):**
```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
SESSION_SECRET=your_session_secret
```

---

### `.gitignore`
**Purpose**: Tells Git which files/folders to exclude from version control.

**Typical contents:**
```gitignore
# Dependencies
node_modules/

# Environment variables
.env
.env.local

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
```

**Why ignore these?**
- `node_modules/` - Too large, can be regenerated with `npm install`
- `.env` - Contains secrets that should never be public
- Log files - Generated files, not source code
- OS/IDE files - Personal settings, not project-related

---

### `package.json`
**Purpose**: Project manifest that defines metadata, dependencies, and scripts.

**Example:**
```json
{
  "name": "nutri-genie",
  "version": "1.0.0",
  "description": "AI-powered Personal Health Consultant",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["health", "ai", "fitness", "nutrition"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "@google/generative-ai": "^0.2.0",
    "express-session": "^1.17.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**Key sections**:
- **dependencies**: Packages needed in production
- **devDependencies**: Packages only needed for development
- **scripts**: Custom commands (`npm start`, `npm run dev`)

---

### `server.js`
**Purpose**: The main application file that ties everything together.

**Core responsibilities**:
1. ✅ Initialize Express server
2. ✅ Connect to MongoDB
3. ✅ Configure middleware (body parsing, sessions, static files)
4. ✅ Define routes (GET/POST endpoints)
5. ✅ Integrate Gemini AI for recommendations
6. ✅ Render EJS templates with dynamic data
7. ✅ Handle errors

**Typical structure:**

```javascript
// ============================================
// 1. IMPORTS & CONFIGURATION
// ============================================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 2. MIDDLEWARE SETUP
// ============================================

// Parse incoming form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from /public
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Session management (for user authentication)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// ============================================
// 3. DATABASE CONNECTION
// ============================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define MongoDB Schema & Model
const HealthDataSchema = new mongoose.Schema({
  userId: String,
  age: Number,
  weight: Number,
  height: Number,
  goalType: String, // 'weight_loss', 'muscle_gain', 'maintain'
  allergies: [String],
  bmr: Number,
  tdee: Number,
  mealPlan: Object,
  workoutPlan: Object,
  createdAt: { type: Date, default: Date.now }
});

const HealthData = mongoose.model('HealthData', HealthDataSchema);

// ============================================
// 4. GEMINI AI INITIALIZATION
// ============================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ============================================
// 5. ROUTES
// ============================================

// ---------- HOME PAGE ----------
app.get('/', (req, res) => {
  res.render('home');
});

// ---------- LOGIN PAGE ----------
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  // Authentication logic here
  req.session.userId = req.body.email; // Simplified example
  res.redirect('/input');
});

// ---------- DATA INPUT FORM ----------
app.get('/input', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('index');
});

// ---------- AI PROCESSING & RESULTS ----------
app.post('/generate', async (req, res) => {
  try {
    const { age, weight, height, gender, activityLevel, goalType, allergies } = req.body;
    
    // Calculate BMR (Basal Metabolic Rate)
    let bmr;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
    
    // Generate AI meal plan using Gemini
    const mealPrompt = `
      Create a personalized meal plan for someone with:
      - TDEE: ${tdee} calories
      - Goal: ${goalType}
      - Allergies: ${allergies || 'none'}
      
      Provide 3 meals (breakfast, lunch, dinner) with calorie counts.
      Format as JSON.
    `;
    
    const mealResult = await model.generateContent(mealPrompt);
    const mealPlan = JSON.parse(mealResult.response.text());
    
    // Generate AI workout plan using Gemini
    const workoutPrompt = `
      Create a personalized workout plan for someone with:
      - Goal: ${goalType}
      - Activity level: ${activityLevel}
      
      Provide 5 exercises with sets, reps, and rest time.
      Format as JSON.
    `;
    
    const workoutResult = await model.generateContent(workoutPrompt);
    const workoutPlan = JSON.parse(workoutResult.response.text());
    
    // Save to MongoDB
    const healthData = new HealthData({
      userId: req.session.userId,
      age, weight, height, goalType,
      allergies: allergies ? allergies.split(',') : [],
      bmr: Math.round(bmr),
      tdee,
      mealPlan,
      workoutPlan
    });
    
    await healthData.save();
    
    // Render result page with AI recommendations
    res.render('result', {
      bmr: Math.round(bmr),
      tdee,
      mealPlan,
      workoutPlan,
      goalType
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error generating recommendations');
  }
});

// ---------- DASHBOARD (User History) ----------
app.get('/dashboard', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  
  // Fetch all user's health data from MongoDB
  const userHistory = await HealthData.find({ userId: req.session.userId })
    .sort({ createdAt: -1 });
  
  res.render('dashboard', { history: userHistory });
});

// ============================================
// 6. START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Nutri-Genie server running on http://localhost:${PORT}`);
});
```

---

## 🔄 Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. LANDING PAGE (home.ejs)                   │
│  • User sees marketing content, features, CTAs                  │
│  • Route: GET /                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ Click "Get Started"
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. LOGIN (login.ejs)                         │
│  • User enters email/password                                   │
│  • Route: GET /login → POST /login                              │
│  • Session created with userId                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │ Successful login
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 3. INPUT FORM (index.ejs)                       │
│  • User enters: age, weight, height, goals, allergies           │
│  • Route: GET /input                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ Submit form
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              4. AI PROCESSING (server.js backend)               │
│  • Calculate BMR & TDEE                                         │
│  • Call Gemini AI API for meal plan                             │
│  • Call Gemini AI API for workout plan                          │
│  • Save data to MongoDB                                         │
│  • Route: POST /generate                                        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 5. RESULTS PAGE (result.ejs)                    │
│  • Display BMR, TDEE, personalized meal plan, workout plan      │
│  • Show "View Dashboard" link                                   │
│  • Route: renders after POST /generate                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ Click "Dashboard"
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  6. DASHBOARD (dashboard.ejs)                   │
│  • Fetch all user's saved plans from MongoDB                    │
│  • Display history, progress charts, statistics                 │
│  • Route: GET /dashboard                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Integration (Gemini 1.5 Flash)

### **Where AI Integration Happens**

AI is integrated in `server.js` in the `/generate` route (POST request).

### **Step-by-Step AI Flow**

1. **Initialization** (top of server.js):
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

2. **User submits health data** via form in `index.ejs`

3. **Server calculates BMR/TDEE** using standard formulas

4. **Server creates AI prompts** with user's specific data:
```javascript
const mealPrompt = `
  Create a personalized meal plan for:
  - TDEE: ${tdee} calories
  - Goal: ${goalType}
  - Allergies: ${allergies}
  Provide JSON format with breakfast, lunch, dinner.
`;
```

5. **Server calls Gemini AI**:
```javascript
const result = await model.generateContent(mealPrompt);
const mealPlan = JSON.parse(result.response.text());
```

6. **Server saves AI response to MongoDB** and renders `result.ejs`

### **Why Gemini 1.5 Flash?**
- ⚡ **Fast**: Returns results in 1-2 seconds
- 🎯 **Accurate**: Understands complex nutrition/fitness context
- 💰 **Cost-effective**: Cheaper than larger models
- 🔄 **Context-aware**: Respects allergies, goals, preferences

---

## 🎨 How EJS Templates Work

### **Rendering Flow**

```javascript
// Server side (server.js)
app.get('/result', (req, res) => {
  res.render('result', {
    bmr: 1650,
    tdee: 2200,
    meals: [...]
  });
});
```

```html
<!-- Client side (result.ejs) -->
<h1>Your BMR: <%= bmr %> calories</h1>
<h2>Your TDEE: <%= tdee %> calories</h2>
```

**Output HTML sent to browser:**
```html
<h1>Your BMR: 1650 calories</h1>
<h2>Your TDEE: 2200 calories</h2>
```

### **EJS Features Used in Nutri-Genie**

| Feature | Syntax | Use Case |
|---------|--------|----------|
| **Variable output** | `<%= var %>` | Display user name, BMR, calories |
| **Loops** | `<% array.forEach() %>` | List meal items, exercises |
| **Conditionals** | `<% if (condition) %>` | Show different content based on goal |
| **Partials** | `<%- include('header') %>` | Reuse navigation, footer |

---

## 📦 Static Assets from `/public`

### **How Static Files Are Served**

**Configuration in server.js:**
```javascript
app.use(express.static('public'));
```

This tells Express: *"Any file in the `/public` folder can be accessed directly via URL."*

### **Examples**

| File Path | URL | Used In |
|-----------|-----|---------|
| `public/css/styles.css` | `/css/styles.css` | All EJS templates |
| `public/images/logo.png` | `/images/logo.png` | Navigation bar |
| `public/js/form-validation.js` | `/js/form-validation.js` | `index.ejs` |

**Usage in EJS templates:**
```html
<!-- In any .ejs file -->
<link rel="stylesheet" href="/css/styles.css">
<img src="/images/logo.png" alt="Nutri-Genie Logo">
<script src="/js/form-validation.js"></script>
```

**Note**: No need to write `/public/` in URLs - Express automatically serves from that directory.

---

## 🗄️ MongoDB Connection & Data Storage

### **Connection**
```javascript
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection error:', err));
```

### **Schema Definition**
```javascript
const HealthDataSchema = new mongoose.Schema({
  userId: String,           // Links to user session
  age: Number,
  weight: Number,
  height: Number,
  goalType: String,         // 'weight_loss', 'muscle_gain', 'maintain'
  allergies: [String],      // Array of allergens
  bmr: Number,
  tdee: Number,
  mealPlan: Object,         // AI-generated meal suggestions
  workoutPlan: Object,      // AI-generated exercise plan
  createdAt: { type: Date, default: Date.now }
});
```

### **Data Operations**

**Save new health data:**
```javascript
const data = new HealthData({ userId, age, weight, ... });
await data.save();
```

**Retrieve user history:**
```javascript
const history = await HealthData.find({ userId })
  .sort({ createdAt: -1 });
```

---

## 🚀 Getting Started

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/nutri-genie.git
cd nutri-genie
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up Environment Variables**
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/nutrigenie
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
SESSION_SECRET=random_secret_string
```

### **4. Start MongoDB**
```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, just ensure your URI is correct in .env
```

### **5. Run the Server**
```bash
# Production mode
npm start

# Development mode (auto-restart on changes)
npm run dev
```

### **6. Open in Browser**
Navigate to: `http://localhost:3000`

---

## 🛠️ Best Practices

### **Security**
- ✅ Keep `.env` file out of version control
- ✅ Use HTTPS in production
- ✅ Validate and sanitize all user inputs
- ✅ Implement proper authentication (hashed passwords)
- ✅ Rate limit API endpoints

### **Code Organization**
- ✅ Separate routes into different files (`routes/auth.js`, `routes/health.js`)
- ✅ Create a `models/` folder for Mongoose schemas
- ✅ Use a `controllers/` folder for business logic
- ✅ Keep `server.js` lean and focused

### **Performance**
- ✅ Cache AI responses for common queries
- ✅ Index MongoDB fields used in queries
- ✅ Compress images in `/public`
- ✅ Use CDN for Tailwind CSS in production

### **Development**
- ✅ Use `nodemon` for auto-restart during development
- ✅ Write clear commit messages
- ✅ Test API endpoints before deploying
- ✅ Keep dependencies updated

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [EJS Documentation](https://ejs.co/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

## 📝 License

MIT

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

**Built with 💜 by the Nutri-Genie Team**
