import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Production CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://dockflowteam.vercel.app',
  'https://docflow-client.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      } else {
        return callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint for Render monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DocFlow Backend API is running' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(`Unhandled Error: ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Auto-seed demo users if missing in production DB
const autoSeedUsers = async () => {
  try {
    const seedUsers = [
      { name: 'Amit Ahir', email: 'amit@example.com', password: 'Amit@123' },
      { name: 'Rahul Shah', email: 'rahul@example.com', password: 'Rahul@123' },
    ];
    for (const userData of seedUsers) {
      const existing = await User.findOne({ email: userData.email.toLowerCase() });
      if (!existing) {
        await User.create(userData);
        console.log(`Auto-seeded user: ${userData.email}`);
      }
    }
  } catch (err) {
    console.error('Auto-seed notice:', err.message);
  }
};

const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await connectDB();
    await autoSeedUsers();
    app.listen(PORT, () => {
      console.log(`DocFlow Server running on port ${PORT}`);
    });
  }
};

startServer();

export default app;
