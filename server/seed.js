import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedUsers = [
  {
    name: 'Amit Ahir',
    email: 'amit@example.com',
    password: 'Amit@123',
  },
  {
    name: 'Rahul Shah',
    email: 'rahul@example.com',
    password: 'Rahul@123',
  },
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/docflow';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding...');

    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });

      if (existingUser) {
        existingUser.name = userData.name;
        existingUser.password = userData.password; // Triggers pre-save hook to hash
        await existingUser.save();
        console.log(`Updated user: ${userData.email}`);
      } else {
        await User.create(userData);
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log('Database seeding complete successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
