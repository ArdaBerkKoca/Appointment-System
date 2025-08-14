import dotenv from 'dotenv';
import path from 'path';
// Load environment variables as early as possible
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFound } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import appointmentRoutes from './routes/appointments';
import notificationRoutes from './routes/notifications';
import aiRoutes from './routes/ai';
import oneSignalRoutes from './routes/oneSignal';
import testRoutes from './routes/test';
import { appointmentScheduler } from './utils/scheduler';
import { reminderScheduler } from './utils/reminderScheduler';

// Debug environment variables
console.log('🔧 Environment variables check:');
console.log('  - EMAIL_USER:', process.env.EMAIL_USER ? 'configured' : 'not configured');
console.log('  - EMAIL_PASS:', process.env.EMAIL_PASS ? 'configured' : 'not configured');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - PORT:', process.env.PORT);
if (!process.env.JWT_SECRET) {
  console.warn('  - JWT_SECRET: not configured');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/onesignal', oneSignalRoutes);
app.use('/api/test', testRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  
  // Start schedulers
  appointmentScheduler.start();
  reminderScheduler.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  appointmentScheduler.stop();
  reminderScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  appointmentScheduler.stop();
  reminderScheduler.stop();
  process.exit(0);
});

export default app; 