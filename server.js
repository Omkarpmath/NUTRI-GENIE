// ============================================
// NUTRI-GENIE SERVER
// AI-Powered Personal Health Consultant
// ============================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (Required for Render/Heroku to handle secure cookies correctly)
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'nutri-genie-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only true in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// ============================================
// MONGODB CONNECTION
// ============================================

const mongooseOptions = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrigenie', mongooseOptions)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('💡 Troubleshooting steps:');
        console.log('   1. Check your MONGODB_URI in .env file');
        console.log('   2. Verify your MongoDB Atlas credentials are correct');
        console.log('   3. Ensure your IP address is whitelisted in MongoDB Atlas');
        console.log('   4. Check if your database user has proper permissions');
    });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from MongoDB');
});

// ============================================
// MONGOOSE SCHEMAS & MODELS
// ============================================

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Health Data Schema
const HealthDataSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userEmail: String,

    // User Input Data
    age: Number,
    weight: Number,
    height: Number,
    gender: String,
    activityLevel: String,
    goalType: String,
    allergies: [String],

    // Calculated Values
    bmr: Number,
    tdee: Number,
    targetCalories: Number,

    // AI Generated Plans
    mealPlan: Object,
    workoutPlan: Object,

    createdAt: { type: Date, default: Date.now }
});

const HealthData = mongoose.model('HealthData', HealthDataSchema);

// ============================================
// GEMINI AI INITIALIZATION
// ============================================

let model = null;

if (process.env.GEMINI_API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
        console.error('❌ Gemini AI initialization error:', error.message);
    }
} else {
    console.warn('⚠️  GEMINI_API_KEY not found in .env file');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
function calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
        return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        return 10 * weight + 6.25 * height - 5 * age - 161;
    }
}

// Calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(bmr, activityLevel) {
    const multipliers = {
        sedentary: 1.2,       // Little or no exercise
        light: 1.375,         // Light exercise 1-3 days/week
        moderate: 1.55,       // Moderate exercise 3-5 days/week
        active: 1.725,        // Heavy exercise 6-7 days/week
        very_active: 1.9      // Very heavy exercise, physical job
    };
    return bmr * (multipliers[activityLevel] || 1.2);
}

// Calculate target calories based on goal
function calculateTargetCalories(tdee, goalType) {
    switch (goalType) {
        case 'weight_loss':
            return Math.round(tdee - 500); // 500 calorie deficit
        case 'muscle_gain':
            return Math.round(tdee + 300); // 300 calorie surplus
        case 'maintain':
        default:
            return Math.round(tdee);
    }
}

// ============================================
// ROUTES
// ============================================

// ---------- HOME PAGE ----------
app.get('/', (req, res) => {
    res.render('home', {
        user: req.session.user || null
    });
});

// ---------- LOGIN PAGE ----------
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/input');
    }
    res.render('login', { error: null });
});

// Login/Signup Handler
app.post('/login', async (req, res) => {
    console.log('👉 Login/Signup request received:', req.body);
    try {
        const { email, password, action } = req.body;

        if (action === 'signup') {
            console.log('📝 Processing signup for:', email);
            // Simple signup (In production, hash passwords!)
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log('❌ Signup failed: Email already exists');
                return res.render('login', { error: 'Email already exists' });
            }

            const newUser = new User({ email, password, name: email.split('@')[0] });
            await newUser.save();
            console.log('✅ New user created:', newUser.email);

            req.session.user = { email, name: newUser.name };
            console.log('🔐 Session created for new user');

            req.session.save((err) => {
                if (err) {
                    console.error('❌ Session save error:', err);
                    return res.render('login', { error: 'Session error' });
                }
                console.log('🔄 Redirecting to /input');
                res.redirect('/input');
            });
        } else {
            // Login
            console.log('🔑 Processing login for:', email);
            const user = await User.findOne({ email, password });
            if (!user) {
                console.log('❌ Login failed: Invalid credentials');
                return res.render('login', { error: 'Invalid email or password' });
            }

            req.session.user = { email, name: user.name };
            console.log('✅ User found, session created');

            req.session.save((err) => {
                if (err) {
                    console.error('❌ Session save error:', err);
                    return res.render('login', { error: 'Session error' });
                }
                console.log('🔄 Redirecting to /input');
                res.redirect('/input');
            });
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        res.render('login', { error: 'An error occurred' });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ---------- DATA INPUT FORM ----------
app.get('/input', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('index', { user: req.session.user });
});

// ---------- AI PROCESSING & RESULTS ----------
app.post('/generate', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const { age, weight, height, gender, activityLevel, goalType, allergies } = req.body;

        // Validate input
        if (!age || !weight || !height || !gender || !activityLevel || !goalType) {
            return res.status(400).send('Missing required fields');
        }

        // Calculate BMR and TDEE
        const bmr = calculateBMR(parseFloat(weight), parseFloat(height), parseInt(age), gender);
        const tdee = calculateTDEE(bmr, activityLevel);
        const targetCalories = calculateTargetCalories(tdee, goalType);

        // Process allergies
        const allergyList = allergies ? allergies.split(',').map(a => a.trim()).filter(a => a) : [];

        let mealPlan = null;
        let workoutPlan = null;

        // Generate AI recommendations if API key is available
        if (model) {
            try {
                // Generate Meal Plan
                const mealPrompt = `You are a professional nutritionist creating a HIGHLY PERSONALIZED 7-DAY meal plan.

USER PROFILE:
- Age: ${age} years
- Weight: ${weight} kg
- Height: ${height} cm
- Gender: ${gender}
- Activity Level: ${activityLevel}
- Goal: ${goalType.replace('_', ' ')}
- Target Calories: ${targetCalories} calories/day
- Allergies/Restrictions: ${allergyList.length > 0 ? allergyList.join(', ') : 'None'}

⚠️ CRITICAL DIETARY RESTRICTIONS - MUST FOLLOW:
${allergyList.length > 0 ? allergyList.map(allergy => {
                    const lower = allergy.toLowerCase();
                    if (lower.includes('nonveg') || lower.includes('non-veg') || lower.includes('non veg') || lower.includes('meat')) {
                        return `- STRICTLY VEGETARIAN ONLY - NO meat, chicken, beef, pork, lamb, fish, seafood, or any animal flesh whatsoever. Eggs and dairy are allowed unless specified.`;
                    } else if (lower.includes('vegan')) {
                        return `- STRICTLY VEGAN - NO animal products at all (no meat, dairy, eggs, honey, etc.)`;
                    } else if (lower.includes('egg')) {
                        return `- NO eggs or egg-based products`;
                    } else if (lower.includes('dairy') || lower.includes('lactose')) {
                        return `- NO dairy products (milk, cheese, yogurt, butter, etc.)`;
                    } else if (lower.includes('gluten')) {
                        return `- NO gluten (wheat, barley, rye)`;
                    } else {
                        return `- ABSOLUTELY NO ${allergy}`;
                    }
                }).join('\n') : '- No dietary restrictions'}

IMPORTANT: 
1. Create a UNIQUE 7-DAY meal plan based on this user's exact profile
2. DO NOT use generic/template meals
3. NEVER include any restricted foods mentioned above
4. If user cannot eat NONVEG/meat, suggest ONLY vegetarian protein sources
5. Ensure variety across the 7 days

For ${goalType === 'weight_loss' ? 'weight loss, focus on high protein, moderate carbs, healthy fats' : goalType === 'muscle_gain' ? 'muscle gain, focus on high protein, high carbs, moderate fats' : 'maintenance, balanced macros'}

Provide a JSON response with this EXACT structure (NO markdown, ONLY JSON):
{
  "day1": {
    "breakfast": { "name": "...", "description": "...", "ingredients": ["..."], "preparation": "...", "calories": 0, "protein": "...", "carbs": "...", "fats": "..." },
    "lunch": { "name": "...", "description": "...", "ingredients": ["..."], "preparation": "...", "calories": 0, "protein": "...", "carbs": "...", "fats": "..." },
    "dinner": { "name": "...", "description": "...", "ingredients": ["..."], "preparation": "...", "calories": 0, "protein": "...", "carbs": "...", "fats": "..." },
    "snacks": { "name": "...", "description": "...", "items": ["..."], "calories": 0 }
  },
  "day2": { ... same structure ... },
  "day3": { ... same structure ... },
  "day4": { ... same structure ... },
  "day5": { ... same structure ... },
  "day6": { ... same structure ... },
  "day7": { ... same structure ... }
}

CRITICAL REQUIREMENTS: 
- Total calories per day MUST equal ${targetCalories} (±50 calories)
- STRICTLY AVOID all listed restrictions
- Return ONLY valid JSON`;

                console.log('🤖 Generating 7-day meal plan with Gemini AI...');
                console.log('📋 User restrictions:', allergyList.length > 0 ? allergyList.join(', ') : 'None');

                const mealResult = await model.generateContent(mealPrompt);
                const mealText = mealResult.response.text();

                console.log('✅ AI Response received');

                // Extract JSON from response (handle markdown code blocks)
                const jsonMatch = mealText.match(/```json\n([\s\S]*?)\n```/) || mealText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    mealPlan = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                }

                // Generate Workout Plan
                const workoutPrompt = `You are a certified fitness trainer. Create a personalized workout plan for someone with these details:

- Goal: ${goalType.replace('_', ' ')}
- Activity Level: ${activityLevel}
- Gender: ${gender}

Provide a JSON response with this exact structure:
{
  "summary": "Brief workout plan overview",
  "exercises": [
    {
      "name": "Exercise name",
      "type": "cardio/strength/flexibility",
      "sets": "number or N/A",
      "reps": "number or duration",
      "rest": "rest time",
      "notes": "brief tips"
    }
  ],
  "weeklySchedule": "Recommended weekly frequency"
}

Include 5-7 exercises suitable for the goal.`;

                const workoutResult = await model.generateContent(workoutPrompt);
                const workoutText = workoutResult.response.text();

                // Extract JSON from response
                const workoutJsonMatch = workoutText.match(/```json\n([\s\S]*?)\n```/) || workoutText.match(/\{[\s\S]*\}/);
                if (workoutJsonMatch) {
                    workoutPlan = JSON.parse(workoutJsonMatch[1] || workoutJsonMatch[0]);
                }

            } catch (aiError) {
                console.error('AI generation error:', aiError);
                throw new Error('AI generation failed');
            }
        }

        // Check if plans were generated
        if (!mealPlan) {
            console.log('❌ Failed to generate meal plan');
            throw new Error('Failed to generate meal plan');
        }
        if (!workoutPlan) {
            console.log('❌ Failed to generate workout plan');
            throw new Error('Failed to generate workout plan');
        }

        // Save to database
        const healthData = new HealthData({
            userId: req.session.user.email,
            userEmail: req.session.user.email,
            age: parseInt(age),
            weight: parseFloat(weight),
            height: parseFloat(height),
            gender,
            activityLevel,
            goalType,
            allergies: allergyList,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories,
            mealPlan,
            workoutPlan
        });

        await healthData.save();

        // Render results
        res.render('result', {
            user: req.session.user,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories,
            goalType,
            mealPlan,
            workoutPlan,
            allergies: allergyList
        });

    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).send('Error generating health plan. Please try again.');
    }
});

// ---------- DASHBOARD (User History) ----------
app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        // Fetch all user's health data
        const userHistory = await HealthData.find({ userId: req.session.user.email })
            .sort({ createdAt: -1 })
            .limit(10);

        // Calculate some statistics
        const stats = {
            totalPlans: userHistory.length,
            avgCalories: userHistory.length > 0
                ? Math.round(userHistory.reduce((sum, item) => sum + item.targetCalories, 0) / userHistory.length)
                : 0
        };

        res.render('dashboard', {
            user: req.session.user,
            history: userHistory,
            stats
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

// TEMPORARY TEST ROUTE
app.get('/test-result', (req, res) => {
    const mockMealPlan = {};
    for (let i = 1; i <= 7; i++) {
        mockMealPlan[`day${i}`] = {
            breakfast: { name: `Day ${i} Breakfast`, description: "Tasty breakfast", ingredients: ["Egg", "Toast"], calories: 400, protein: "20g", carbs: "30g", fats: "10g" },
            lunch: { name: `Day ${i} Lunch`, description: "Healthy lunch", ingredients: ["Chicken", "Rice"], calories: 600, protein: "40g", carbs: "50g", fats: "15g" },
            dinner: { name: `Day ${i} Dinner`, description: "Light dinner", ingredients: ["Salad", "Tofu"], calories: 500, protein: "25g", carbs: "20g", fats: "20g" },
            snacks: { name: `Day ${i} Snack`, description: "Quick snack", items: ["Apple"], calories: 100 }
        };
    }

    res.render('result', {
        user: { name: "Test User" },
        bmr: 1500,
        tdee: 2000,
        targetCalories: 2000,
        goalType: "maintain",
        mealPlan: mockMealPlan,
        workoutPlan: { summary: "Test Workout", weeklySchedule: "3x week", exercises: [] },
        allergies: []
    });
});

// ---------- API ENDPOINT (optional, for AJAX requests) ----------
app.post('/api/calculate', async (req, res) => {
    const { age, weight, height, gender, activityLevel } = req.body;

    const bmr = calculateBMR(parseFloat(weight), parseFloat(height), parseInt(age), gender);
    const tdee = calculateTDEE(bmr, activityLevel);

    res.json({
        bmr: Math.round(bmr),
        tdee: Math.round(tdee)
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Something went wrong!');
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`\n🚀 Nutri-Genie server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Views directory: ${path.join(__dirname, 'views')}`);
    console.log(`📁 Public directory: ${path.join(__dirname, 'public')}`);
    console.log(`🤖 AI Status: ${model ? 'Ready' : 'Not configured (add GEMINI_API_KEY to .env)'}`);
    console.log(`\n💡 Quick Start:`);
    console.log(`   1. Visit http://localhost:${PORT}`);
    console.log(`   2. Click "Get Started" and create an account`);
    console.log(`   3. Enter your health data`);
    console.log(`   4. Get AI-powered recommendations!\n`);
});
