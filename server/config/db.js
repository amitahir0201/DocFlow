import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServerInstance = null;

const connectDB = async () => {
  const isTest = process.env.NODE_ENV === 'test';
  
  // In automated testing (Vitest), use MongoMemoryServer for instant, isolated in-memory DB testing
  if (isTest) {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    if (!mongoServerInstance) {
      mongoServerInstance = await MongoMemoryServer.create();
    }
    const testUri = mongoServerInstance.getUri();
    const conn = await mongoose.connect(testUri);
    return conn;
  }

  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/docflow';
  const isRenderProduction = !!process.env.RENDER;

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Atlas connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Atlas connection notice: ${error.message}`);
    
    // On Render Cloud Production, fail fast so Render alerts on missing MONGO_URI settings
    if (isRenderProduction) {
      console.error('CRITICAL: Render Production MongoDB Atlas connection failed. Verify MONGO_URI in Render dashboard settings.');
      throw error;
    }

    // In local development, if local IP is not whitelisted on Atlas (SSL alert 80), fallback to memory server so npm run dev never crashes
    console.log('--------------------------------------------------');
    console.log('💡 LOCAL DEV NOTICE: Could not connect to Atlas from local IP.');
    console.log('👉 To connect to Atlas locally: Add 0.0.0.0/0 under Network Access in MongoDB Atlas.');
    console.log('⚡ Starting local in-memory database fallback so local dev server runs smoothly...');
    console.log('--------------------------------------------------');

    try {
      if (!mongoServerInstance) {
        mongoServerInstance = await MongoMemoryServer.create();
      }
      const fallbackUri = mongoServerInstance.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log('Local in-memory MongoDB connected successfully for dev!');
      return conn;
    } catch (fallbackErr) {
      console.error(`MongoDB fallback connection failed: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
