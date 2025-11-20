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
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
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
                const mealPrompt = `You are a professional nutritionist creating a HIGHLY PERSONALIZED meal plan.

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
1. Create a UNIQUE meal plan based on this user's exact profile
2. DO NOT use generic/template meals
3. NEVER include any restricted foods mentioned above
4. If user cannot eat NONVEG/meat, suggest ONLY vegetarian protein sources (paneer, tofu, legumes, beans, lentils, chickpeas, etc.)

For ${goalType === 'weight_loss' ? 'weight loss, focus on high protein, moderate carbs, healthy fats' : goalType === 'muscle_gain' ? 'muscle gain, focus on high protein, high carbs, moderate fats with VEGETARIAN sources if restricted' : 'maintenance, balanced macros'}

Provide a JSON response with this EXACT structure (NO markdown, ONLY JSON):
{
  "breakfast": {
    "name": "Specific meal name",
    "description": "Detailed description with main ingredients",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "preparation": "Brief preparation steps",
    "calories": number,
    "protein": "Xg",
    "carbs": "Xg",
    "fats": "Xg"
  },
  "lunch": {
    "name": "Specific meal name",
    "description": "Detailed description with main ingredients",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "preparation": "Brief preparation steps",
    "calories": number,
    "protein": "Xg",
    "carbs": "Xg",
    "fats": "Xg"
  },
  "dinner": {
    "name": "Specific meal name",
    "description": "Detailed description with main ingredients",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "preparation": "Brief preparation steps",
    "calories": number,
    "protein": "Xg",
    "carbs": "Xg",
    "fats": "Xg"
  },
  "snacks": {
    "name": "2-3 specific snack options",
    "description": "Detailed snack suggestions",
    "items": ["snack 1", "snack 2"],
    "calories": number
  }
}

CRITICAL REQUIREMENTS: 
- Total calories MUST equal ${targetCalories} (±50 calories)
- STRICTLY AVOID all listed restrictions above
- If NONVEG restriction: Use ONLY vegetarian proteins (paneer, tofu, beans, lentils, chickpeas, tempeh, seitan)
- Make meals SPECIFIC and VARIED (not generic)
- Include realistic portion sizes
- Return ONLY valid JSON (no extra text)`;

                console.log('🤖 Generating meal plan with Gemini AI...');
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
                // Continue with fallback data
            }
        }

        // Fallback data if AI fails or no API key
        if (!mealPlan) {
            console.log('⚠️ Using fallback meal plans');

            // Check if user requires vegetarian meals
            const isVegetarian = allergyList.some(a => {
                const lower = a.toLowerCase();
                return lower.includes('nonveg') || lower.includes('non-veg') ||
                    lower.includes('non veg') || lower.includes('meat') ||
                    lower.includes('chicken') || lower.includes('fish') ||
                    lower.includes('beef') || lower.includes('pork');
            });

            if (isVegetarian) {
                console.log('🥬 User is VEGETARIAN - using vegetarian fallback meals');

                // Vegetarian meal plans based on goal
                const vegetarianMeals = {
                    weight_loss: {
                        breakfast: {
                            name: "High-Protein Tofu Scramble",
                            description: "Scrambled tofu with spinach, bell peppers, and whole grain toast",
                            ingredients: ["200g firm tofu", "1 cup spinach", "1/2 cup bell peppers", "1 slice whole grain toast", "Turmeric", "Black salt"],
                            preparation: "Crumble tofu, sauté with spices and vegetables, serve with toast",
                            calories: Math.round(targetCalories * 0.25),
                            protein: "24g",
                            carbs: "28g",
                            fats: "10g"
                        },
                        lunch: {
                            name: "Chickpea & Quinoa Power Bowl",
                            description: "Roasted chickpeas with quinoa, cucumber, tomatoes, and tahini dressing",
                            ingredients: ["1 cup cooked chickpeas", "1/2 cup quinoa", "Mixed salad vegetables", "2 tbsp tahini", "Lemon juice"],
                            preparation: "Roast chickpeas, cook quinoa, combine with fresh vegetables and tahini dressing",
                            calories: Math.round(targetCalories * 0.35),
                            protein: "22g",
                            carbs: "45g",
                            fats: "14g"
                        },
                        dinner: {
                            name: "Grilled Paneer with Roasted Vegetables",
                            description: "Tandoori-spiced grilled paneer with cauliflower rice and broccoli",
                            ingredients: ["150g paneer", "2 cups cauliflower rice", "1 cup broccoli", "Tandoori spices"],
                            preparation: "Marinate and grill paneer, roast vegetables, prepare cauliflower rice",
                            calories: Math.round(targetCalories * 0.30),
                            protein: "26g",
                            carbs: "22g",
                            fats: "16g"
                        },
                        snacks: {
                            name: "Protein-Rich Vegetarian Snacks",
                            description: "Roasted chickpeas, mixed nuts, or hummus with veggies",
                            items: ["Roasted chickpeas (100g)", "Mixed nuts (30g)", "Hummus with carrot sticks"],
                            calories: Math.round(targetCalories * 0.10)
                        }
                    },
                    muscle_gain: {
                        breakfast: {
                            name: "Protein-Loaded Paneer Pancakes",
                            description: "High-protein pancakes made with paneer, oats, and banana",
                            ingredients: ["100g grated paneer", "1 cup oats", "2 eggs (or flax eggs)", "1 banana", "2 tbsp peanut butter", "Honey"],
                            preparation: "Blend oats, mix with paneer and banana, cook pancakes, top with peanut butter",
                            calories: Math.round(targetCalories * 0.25),
                            protein: "32g",
                            carbs: "58g",
                            fats: "18g"
                        },
                        lunch: {
                            name: "Lentil & Sweet Potato Power Bowl",
                            description: "Red lentil dal with roasted sweet potato, brown rice, and avocado",
                            ingredients: ["1 cup cooked red lentils", "1 large sweet potato", "1 cup brown rice", "1/2 avocado", "Indian spices"],
                            preparation: "Cook lentils with spices, roast sweet potato, prepare rice, combine with avocado",
                            calories: Math.round(targetCalories * 0.35),
                            protein: "28g",
                            carbs: "75g",
                            fats: "18g"
                        },
                        dinner: {
                            name: "Tofu Stir-Fry with Noodles",
                            description: "Crispy tofu with whole wheat noodles and Asian vegetables",
                            ingredients: ["250g firm tofu", "150g whole wheat noodles", "Mixed stir-fry vegetables", "Soy sauce", "Sesame oil"],
                            preparation: "Press and fry tofu until crispy, cook noodles, stir-fry vegetables, combine",
                            calories: Math.round(targetCalories * 0.30),
                            protein: "35g",
                            carbs: "62g",
                            fats: "20g"
                        },
                        snacks: {
                            name: "High-Calorie Vegetarian Snacks",
                            description: "Protein smoothie, trail mix, or peanut butter sandwich",
                            items: ["Protein smoothie with banana & nuts (350 cal)", "Trail mix with dried fruits (250 cal)", "Almond butter sandwich"],
                            calories: Math.round(targetCalories * 0.10)
                        }
                    },
                    maintain: {
                        breakfast: {
                            name: "Vegetarian Oatmeal Power Bowl",
                            description: "Steel-cut oats with chia seeds, berries, nuts, and plant protein",
                            ingredients: ["1 cup oats", "1 tbsp chia seeds", "1/2 cup mixed berries", "20 almonds", "1 scoop plant protein", "Almond milk"],
                            preparation: "Cook oats with chia seeds, top with berries, nuts, and protein powder",
                            calories: Math.round(targetCalories * 0.25),
                            protein: "22g",
                            carbs: "50g",
                            fats: "14g"
                        },
                        lunch: {
                            name: "Mediterranean Falafel Wrap",
                            description: "Homemade falafel wrap with hummus, tahini, and fresh vegetables",
                            ingredients: ["Whole wheat wrap", "4 falafels", "3 tbsp hummus", "Mixed vegetables", "30g feta", "Tahini sauce"],
                            preparation: "Prepare or heat falafels, spread hummus, add vegetables and feta, drizzle tahini",
                            calories: Math.round(targetCalories * 0.35),
                            protein: "24g",
                            carbs: "52g",
                            fats: "16g"
                        },
                        dinner: {
                            name: "Paneer Tikka with Quinoa",
                            description: "Marinated paneer tikka with vegetable quinoa pilaf",
                            ingredients: ["180g paneer cubes", "1 cup quinoa", "Mixed vegetables", "Yogurt marinade", "Indian spices"],
                            preparation: "Marinate and grill paneer, cook quinoa with vegetables and spices",
                            calories: Math.round(targetCalories * 0.30),
                            protein: "28g",
                            carbs: "48g",
                            fats: "15g"
                        },
                        snacks: {
                            name: "Balanced Vegetarian Snacks",
                            description: "Greek yogurt with fruit, veggie sticks with hummus, or smoothie",
                            items: ["Greek yogurt with berries", "Carrot & cucumber with hummus", "Green smoothie with spinach & banana"],
                            calories: Math.round(targetCalories * 0.10)
                        }
                    }
                };

                mealPlan = vegetarianMeals[goalType] || vegetarianMeals.maintain;

            } else {
                // Non-vegetarian meal plans (original fallbacks)
                const goalSpecificMeals = {
                    weight_loss: {
                        breakfast: {
                            name: "High-Protein Egg White Scramble",
                            description: "Fluffy egg whites with spinach, tomatoes, and whole grain toast",
                            ingredients: ["4 egg whites", "1 cup spinach", "1/2 cup cherry tomatoes", "1 slice whole grain toast"],
                            preparation: "Scramble egg whites with vegetables, serve with toast",
                            calories: Math.round(targetCalories * 0.25),
                            protein: "25g",
                            carbs: "30g",
                            fats: "8g"
                        },
                        lunch: {
                            name: "Grilled Chicken & Veggie Bowl",
                            description: "Lean grilled chicken breast with quinoa and roasted vegetables",
                            ingredients: ["150g chicken breast", "1/2 cup quinoa", "Mixed vegetables", "Lemon dressing"],
                            preparation: "Grill chicken, cook quinoa, roast vegetables, combine",
                            calories: Math.round(targetCalories * 0.35),
                            protein: "40g",
                            carbs: "35g",
                            fats: "12g"
                        },
                        dinner: {
                            name: "Baked Salmon with Cauliflower Rice",
                            description: "Herb-crusted salmon with cauliflower rice and steamed broccoli",
                            ingredients: ["180g salmon fillet", "2 cups cauliflower rice", "1 cup broccoli", "Herbs & lemon"],
                            preparation: "Bake salmon with herbs, steam vegetables, prepare cauliflower rice",
                            calories: Math.round(targetCalories * 0.30),
                            protein: "38g",
                            carbs: "20g",
                            fats: "15g"
                        },
                        snacks: {
                            name: "Low-Calorie Protein Snacks",
                            description: "Greek yogurt, raw almonds, or apple slices",
                            items: ["150g Greek yogurt", "15 almonds", "1 medium apple"],
                            calories: Math.round(targetCalories * 0.10)
                        }
                    },
                    muscle_gain: {
                        breakfast: {
                            name: "Power-Packed Protein Pancakes",
                            description: "Protein pancakes with banana, peanut butter, and honey",
                            ingredients: ["2 scoops protein powder", "2 eggs", "1 banana", "2 tbsp peanut butter", "Honey"],
                            preparation: "Mix ingredients, cook pancakes, top with banana and peanut butter",
                            calories: Math.round(targetCalories * 0.25),
                            protein: "35g",
                            carbs: "55g",
                            fats: "18g"
                        },
                        lunch: {
                            name: "Beef & Sweet Potato Power Bowl",
                            description: "Lean beef with roasted sweet potato, brown rice, and avocado",
                            ingredients: ["200g lean beef", "1 large sweet potato", "1 cup brown rice", "1/2 avocado"],
                            preparation: "Grill beef, roast sweet potato, cook rice, combine with avocado",
                            calories: Math.round(targetCalories * 0.35),
                            protein: "45g",
                            carbs: "68g",
                            fats: "20g"
                        },
                        dinner: {
                            name: "Chicken Pasta with Vegetables",
                            description: "Grilled chicken with whole wheat pasta and mixed vegetables",
                            ingredients: ["200g chicken breast", "150g whole wheat pasta", "Mixed vegetables", "Olive oil"],
                            preparation: "Cook pasta, grill chicken, sauté vegetables, combine",
                            calories: Math.round(targetCalories * 0.30),
                            protein: "42g",
                            carbs: "60g",
                            fats: "16g"
                        },
                        snacks: {
                            name: "High-Calorie Muscle Building Snacks",
                            description: "Trail mix, protein shake, or nut butter sandwich",
                            items: ["Protein shake (300 cal)", "Trail mix (200 cal)", "Nut butter sandwich"],
                            calories: Math.round(targetCalories * 0.10)
                        }
                    },
                    maintain: {
                        breakfast: {
                            name: "Balanced Oatmeal Bowl",
                            description: "Steel-cut oats with berries, nuts, and honey",
                            ingredients: ["1 cup oats", "1/2 cup mixed berries", "15 almonds", "1 tbsp honey", "Milk"],
                            preparation: "Cook oats, top with berries, nuts, and honey",
                            calories: Math.round(targetCalories * 0.25),
                            protein: "18g",
                            carbs: "48g",
                            fats: "12g"
                        },
                        lunch: {
                            name: "Mediterranean Chicken Wrap",
                            description: "Grilled chicken wrap with hummus, vegetables, and feta",
                            ingredients: ["Whole wheat wrap", "150g chicken", "2 tbsp hummus", "Vegetables", "30g feta"],
                            preparation: "Grill chicken, spread hummus, add vegetables and feta, wrap",
                            calories: Math.round(targetCalories * 0.35),
                            protein: "38g",
                            carbs: "45g",
                            fats: "15g"
                        },
                        dinner: {
                            name: "Balanced Stir-Fry",
                            description: "Shrimp stir-fry with mixed vegetables and jasmine rice",
                            ingredients: ["200g shrimp", "Mixed stir-fry vegetables", "1 cup jasmine rice", "Soy sauce"],
                            preparation: "Stir-fry shrimp and vegetables, serve over rice",
                            calories: Math.round(targetCalories * 0.30),
                            protein: "32g",
                            carbs: "50g",
                            fats: "14g"
                        },
                        snacks: {
                            name: "Balanced Healthy Snacks",
                            description: "Fruit with yogurt, crackers with cheese, or smoothie",
                            items: ["Greek yogurt with fruit", "Whole grain crackers with cheese", "Green smoothie"],
                            calories: Math.round(targetCalories * 0.10)
                        }
                    }
                };

                mealPlan = goalSpecificMeals[goalType] || goalSpecificMeals.maintain;
            }
            // This brace closes the `if (!mealPlan)` block that was implicitly opened earlier.
            // The instruction implies this block exists and needs closing here.
            // Based on the provided edit, it seems there was an outer `if (!mealPlan)` block.
            // However, the original code structure suggests the `if (isVegetarian)` block is the outer one.
            // Assuming the instruction refers to a logical block that encompasses the meal plan generation.
            // The most faithful interpretation given the instruction and the provided edit snippet is to add the brace here.
        }
        if (!workoutPlan) {
            workoutPlan = {
                summary: `A balanced ${goalType.replace('_', ' ')} workout plan`,
                exercises: [
                    { name: "Warm-up", type: "cardio", sets: "N/A", reps: "5-10 min", rest: "N/A", notes: "Light cardio" },
                    { name: "Squats", type: "strength", sets: "3", reps: "12-15", rest: "60s", notes: "Focus on form" },
                    { name: "Push-ups", type: "strength", sets: "3", reps: "10-12", rest: "60s", notes: "Modify as needed" },
                    { name: "Planks", type: "core", sets: "3", reps: "30-60s", rest: "45s", notes: "Keep core tight" },
                    { name: "Cardio", type: "cardio", sets: "N/A", reps: "20-30 min", rest: "N/A", notes: "Moderate intensity" }
                ],
                weeklySchedule: "3-5 days per week"
            };
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
