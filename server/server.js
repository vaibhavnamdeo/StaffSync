const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
let mongoServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staffsync';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.log('Local MongoDB not detected on port 27017. Initializing embedded database...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      try {
        mongoServer = await MongoMemoryServer.create({ instance: { port: 27017, dbName: 'staffsync' } });
      } catch (portErr) {
        mongoServer = await MongoMemoryServer.create({ instance: { dbName: 'staffsync' } });
      }
      const memUri = mongoServer.getUri();
      await mongoose.connect(memUri);
      console.log(`Embedded MongoDB started successfully at ${memUri}`);
    } catch (memErr) {
      console.error('Could not connect to MongoDB or start embedded server:', memErr.message);
      process.exit(1);
    }
  }

  // Ensure demo accounts exist
  try {
    const User = require('./src/models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('No users found in database. Auto-seeding default demo accounts...');
      const { seedData } = require('./src/seeders/seed');
      await seedData(false);
    }
  } catch (seedErr) {
    console.error('Auto-seed check warning:', seedErr.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}


// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/employees', require('./src/routes/employees'));
app.use('/api/leaves', require('./src/routes/leaves'));
app.use('/api/attendance', require('./src/routes/attendance'));
app.use('/api/announcements', require('./src/routes/announcements'));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
