# Database Recovery Guide

## What Happened?

The `users` database was accidentally dropped from MongoDB Atlas. When a database is dropped, **all data is permanently deleted** and cannot be recovered unless you have a backup.

## Impact

- **All user accounts** have been deleted
- **All health plans** and generated meal/workout plans have been lost
- The database schema (structure) needs to be recreated

## Important Notes

> ⚠️ **Data Loss**: Unfortunately, the original data cannot be recovered. After following this guide, users will need to create new accounts and the application will start fresh.

## Recovery Steps

### Step 1: Verify Your MongoDB Atlas Connection

1. Open your `.env` file and verify the `MONGODB_URI` is correct:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```

2. Log into [MongoDB Atlas](https://cloud.mongodb.com/)

3. Ensure your current IP address is whitelisted:
   - Go to **Network Access** in the left sidebar
   - Click **Add IP Address**
   - Add your current IP or use `0.0.0.0/0` for testing (allow all - not recommended for production)

### Step 2: Run the Database Setup Script

The `setup-database.js` script will recreate your database schema and collections.

```bash
# Navigate to your project directory
cd /Volumes/Omkar/FullStackProjects/NutriGenie

# Run the setup script
node setup-database.js
```

**Expected Output:**
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB successfully
📊 Database: nutrigenie

📋 Existing collections: (may be empty)

🔧 Setting up Users collection...
✅ Users collection ready with indexes
   - Index on: email (unique)

🔧 Setting up HealthData collection...
✅ HealthData collection ready with indexes
   - Index on: userId

📋 Updated collections: users, healthdatas

📊 Collection Statistics:
   - Users: 0 documents
   - HealthData: 0 documents

✅ Database setup completed successfully!
```

### Step 3: Verify the Setup

1. **Start your application server:**
   ```bash
   nodemon server.js
   ```

2. **Check the server logs** for successful MongoDB connection:
   ```
   ✅ MongoDB connected successfully
   📊 Database: nutrigenie
   ```

3. **Test user registration:**
   - Visit http://localhost:3000
   - Click "Get Started"
   - Create a new account with email and password
   - If registration succeeds, your database is working!

### Step 4: Verify in MongoDB Atlas (Optional)

1. Log into [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Navigate to **Browse Collections**
3. Select your database (e.g., `nutrigenie`)
4. You should see two collections:
   - `users` - Will contain user account data
   - `healthdatas` - Will contain health plans and meal plans

## Troubleshooting

### Error: "Server selection timed out"

**Cause:** Cannot connect to MongoDB Atlas

**Solutions:**
- Check if your IP address is whitelisted in MongoDB Atlas
- Verify `MONGODB_URI` in `.env` is correct
- Ensure your internet connection is working
- Check if MongoDB Atlas is experiencing downtime

### Error: "Authentication failed"

**Cause:** Incorrect database credentials

**Solutions:**
- Verify username and password in `MONGODB_URI`
- Make sure there are no special characters that need URL encoding
- Create a new database user in MongoDB Atlas if needed

### Collections not appearing

**Cause:** Collections are created automatically when data is inserted

**Solution:**
- Collections will appear after you create your first user account
- Run the setup script again if needed

## Prevention

To avoid data loss in the future:

1. **Enable MongoDB Atlas Backups:**
   - Go to your cluster settings
   - Enable Cloud Backups (may require paid tier)

2. **Export Important Data Regularly:**
   ```bash
   # Export users collection
   mongoexport --uri="your-mongodb-uri" --collection=users --out=users-backup.json
   
   # Export healthdatas collection
   mongoexport --uri="your-mongodb-uri" --collection=healthdatas --out=healthdatas-backup.json
   ```

3. **Be Careful with Database Operations:**
   - Always double-check before running delete/drop operations
   - Use MongoDB Compass for visual confirmation before deletions

## Need Help?

If you encounter any issues during recovery:
1. Check the error messages carefully
2. Verify all connection details in `.env`
3. Ensure MongoDB Atlas network access is properly configured
4. Make sure your MongoDB Atlas cluster is running (not paused)
