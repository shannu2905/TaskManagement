import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import taskRoutes from '../routes/task.routes.js';
import { authenticate } from '../middleware/auth.middleware.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Task from '../models/Task.model.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken } from '../utils/jwt.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/tasks', authenticate, taskRoutes);

describe('Task API', () => {
  let authToken;
  let userId;
  let projectId;

  beforeAll(async () => {
    await connectDB();

    // Create test user
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      passwordHash,
      role: 'owner',
    });
    userId = user._id;
    authToken = generateAccessToken(user._id);

    // Create test project
    const project = await Project.create({
      title: 'Test Project',
      description: 'Test Description',
      owner: userId,
      members: [userId],
    });
    projectId = project._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        projectId: projectId.toString(),
        title: 'Test Task',
        desc: 'Test Description',
        status: 'todo',
        priority: 'medium',
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.status).toBe(taskData.status);
    });

    it('should return error for invalid project', async () => {
      const taskData = {
        projectId: new mongoose.Types.ObjectId().toString(),
        title: 'Test Task',
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(404);

      expect(response.body.message).toContain('Project not found');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update task status', async () => {
      const task = await Task.create({
        projectId,
        title: 'Update Test Task',
        status: 'todo',
        priority: 'medium',
      });

      const response = await request(app)
        .patch(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body.status).toBe('in_progress');
    });
  });
});

