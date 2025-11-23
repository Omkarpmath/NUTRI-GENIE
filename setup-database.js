// ============================================
// DATABASE SETUP SCRIPT
// Recreates MongoDB collections and indexes
// ============================================

require('dotenv').config();
const mongoose = require('mongoose');

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
// DATABASE SETUP FUNCTION
// ============================================

async function setupDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');

        const mongooseOptions = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
        console.log('✅ Connected to MongoDB successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);

        // Get list of existing collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 Existing collections:', collections.map(c => c.name).join(', ') || 'None');

        // Create indexes for Users collection
        console.log('\n🔧 Setting up Users collection...');
        await User.createIndexes();
        console.log('✅ Users collection ready with indexes');
        console.log('   - Index on: email (unique)');

        // Create indexes for HealthData collection
        console.log('\n🔧 Setting up HealthData collection...');
        await HealthData.createIndexes();
        console.log('✅ HealthData collection ready with indexes');
        console.log('   - Index on: userId');

        // Verify collections were created
        const updatedCollections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📋 Updated collections:', updatedCollections.map(c => c.name).join(', '));

        // Get collection stats
        const usersCount = await User.countDocuments();
        const healthDataCount = await HealthData.countDocuments();

        console.log('\n📊 Collection Statistics:');
        console.log(`   - Users: ${usersCount} documents`);
        console.log(`   - HealthData: ${healthDataCount} documents`);

        console.log('\n✅ Database setup completed successfully!');
        console.log('\n💡 Next Steps:');
        console.log('   1. Your database schema is now properly configured');
        console.log('   2. Collections will be automatically created when you add data');
        console.log('   3. Start your server with: npm start or nodemon server.js');
        console.log('   4. Create a new account to begin using the app');

    } catch (error) {
        console.error('❌ Database setup error:', error.message);

        if (error.message.includes('Server selection timed out')) {
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Check your MONGODB_URI in .env file');
            console.log('   2. Verify your MongoDB Atlas credentials');
            console.log('   3. Ensure your IP address is whitelisted');
            console.log('   4. Check if network firewall is blocking connection');
        }
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

// Run setup
setupDatabase();
