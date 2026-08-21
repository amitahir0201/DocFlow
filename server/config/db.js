import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServerInstance = null;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/docflow';
    
    // Set 5s timeout for primary connection
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    console.log(`Primary MongoDB connection notice: ${error.message}`);
    console.log('Falling back to local in-memory MongoDB server...');
    try {
      if (!mongoServerInstance) {
        mongoServerInstance = await MongoMemoryServer.create();
      }
      const fallbackUri = mongoServerInstance.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log('MongoDB connected');
      return conn;
    } catch (fallbackErr) {
      console.error(`MongoDB connection failed: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
