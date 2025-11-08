import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Task from '../models/Task.model.js';
import connectDB from '../config/database.js';

dotenv.config();

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    // Wait a bit to ensure connection is stable
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Clearing existing data...');
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log('✅ Cleared existing data');

    // Create users
    const passwordHash = await bcrypt.hash('password123', 10);

    const owner = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash,
      role: 'owner',
      avatar: ''
    });

    const admin = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      passwordHash,
      role: 'admin',
      avatar: ''
    });

    const member = await User.create({
      name: 'Bob Johnson',
      email: 'bob@example.com',
      passwordHash,
      role: 'member',
      avatar: ''
    });

    console.log('✅ Created users');

    // Create project
    const project = await Project.create({
      title: 'Sample Project',
      description: 'This is a sample project for testing',
      owner: owner._id,
      members: [owner._id, admin._id, member._id]
    });

    console.log('✅ Created project');

    // Create tasks
    const task1 = await Task.create({
      projectId: project._id,
      title: 'Design Homepage',
      desc: 'Create a modern and responsive homepage design',
      assignee: owner._id,
      status: 'todo',
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    const task2 = await Task.create({
      projectId: project._id,
      title: 'Implement Authentication',
      desc: 'Set up JWT authentication with refresh tokens',
      assignee: admin._id,
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    });

    const task3 = await Task.create({
      projectId: project._id,
      title: 'Write Documentation',
      desc: 'Document the API endpoints and setup instructions',
      assignee: member._id,
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
    });

    console.log('✅ Created tasks');

    console.log('\n🎉 Seed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Owner: john@example.com / password123');
    console.log('Admin: jane@example.com / password123');
    console.log('Member: bob@example.com / password123');

    // Close connection gracefully
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error.message);
    
    // Provide helpful troubleshooting tips
    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check your MongoDB Atlas username and password');
      console.error('   2. Ensure special characters in password are URL-encoded');
      console.error('   3. Verify database user has proper permissions');
    } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check your IP address is whitelisted in MongoDB Atlas');
      console.error('   2. Verify your internet connection');
      console.error('   3. Check MongoDB Atlas cluster status');
    } else if (error.message.includes('sslvalidate') || (error.message.includes('option') && error.message.includes('not supported'))) {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. This error has been fixed - SSL/TLS is handled automatically');
      console.error('   2. Try running the seed script again: npm run seed');
      console.error('   3. If issue persists, check your connection string format');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check your connection string format');
      console.error('   2. Try updating mongoose: npm update mongoose');
      console.error('   3. Check network/firewall settings');
    } else {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Verify MONGODB_URI in .env file');
      console.error('   2. Check MongoDB Atlas cluster is running');
      console.error('   3. Ensure database name is correct');
    }
    
    // Close connection if open
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seed();

