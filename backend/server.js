import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { checkDueDates } from './utils/dueDateChecker.js';
import { ensureSecrets } from './utils/generateSecrets.js';
import { serveFile } from './middleware/upload.middleware.js';

dotenv.config();

// Generate JWT secrets automatically if not provided
ensureSecrets();

const app = express();
const httpServer = createServer(app);
// Dynamic CORS origin checker: allow configured FRONTEND_URL and any localhost origin (different dev ports)
const corsOriginChecker = (origin, callback) => {
  // Allow requests with no origin (e.g., server-to-server or same-origin)
  if (!origin) return callback(null, true);
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    const allowedFrontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    if (origin === allowedFrontend) {
      console.log('[CORS] allowed origin (matches FRONTEND_URL):', origin);
      return callback(null, true);
    }
    // Allow any localhost (including different dev ports like 5174)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[CORS] allowed origin (localhost):', origin);
      return callback(null, true);
    }
  } catch (e) {
    // If origin is malformed, reject
    console.warn('[CORS] invalid origin value:', origin);
    return callback(new Error('Invalid origin'), false);
  }

  console.warn('[CORS] origin not allowed:', origin);
  return callback(new Error('Not allowed by CORS'), false);
};

const io = new Server(httpServer, {
  cors: {
    origin: corsOriginChecker,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => corsOriginChecker(origin, callback),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room for notifications
  socket.on('join:user', ({ userId }) => {
    socket.join(`user-${userId}`);
  });

  // Legacy event name support
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
  });

  // Project room join/leave (new names)
  socket.on('join:project', ({ projectId }) => {
    socket.join(`project-${projectId}`);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });
  
  socket.on('leave:project', ({ projectId }) => {
    socket.leave(`project-${projectId}`);
    console.log(`User ${socket.id} left project ${projectId}`);
  });

  // Relay project messages to room
  socket.on('project:message', ({ projectId, text, sender }) => {
    const payload = {
      projectId,
      text,
      sender: sender || 'anonymous',
      createdAt: new Date().toISOString(),
    };
    io.to(`project-${projectId}`).emit('project:message', payload);
  });

  // Task movement events (for kanban board)
  socket.on('task:moved', ({ taskId, projectId, newStatus, oldStatus }) => {
    io.to(`project-${projectId}`).emit('task:moved', {
      taskId,
      newStatus,
      oldStatus,
      timestamp: new Date().toISOString()
    });
  });

  // User presence tracking
  socket.on('user:typing', ({ projectId, userId, userName, isTyping }) => {
    socket.to(`project-${projectId}`).emit('user:typing', {
      userId,
      userName,
      isTyping,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);

// File upload route - serve uploaded files
app.get('/api/uploads/:filename', serveFile);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Cron job for due date notifications (runs every hour)
cron.schedule('0 * * * *', async () => {
  await checkDueDates(io);
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

