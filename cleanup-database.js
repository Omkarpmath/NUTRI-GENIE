// ============================================
// DATABASE CLEANUP SCRIPT
// Deletes all test/dummy data from MongoDB
// ============================================

require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
console.log('🔌 Connecting to MongoDB...');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrigenie')
    .then(async () => {
        console.log('✅ Connected to MongoDB');
        console.log(`📊 Database: ${mongoose.connection.name}\n`);

        try {
            // Get all collections
            const collections = await mongoose.connection.db.listCollections().toArray();

            console.log('📋 Found collections:');
            collections.forEach(col => console.log(`   - ${col.name}`));
            console.log('');

            // Delete all documents from each collection
            let totalDeleted = 0;

            for (const collection of collections) {
                const collectionName = collection.name;
                const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
                console.log(`🗑️  Deleted ${result.deletedCount} documents from '${collectionName}'`);
                totalDeleted += result.deletedCount;
            }

            console.log('\n✅ Cleanup complete!');
            console.log(`📊 Total documents deleted: ${totalDeleted}`);

        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        } finally {
            // Close connection
            await mongoose.connection.close();
            console.log('\n🔌 Disconnected from MongoDB');
            process.exit(0);
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
