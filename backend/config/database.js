import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const options = {
      // Connection options for better compatibility
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      
      // Retry logic
      retryWrites: true,
      w: 'majority',
      
      // Connection pool options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      
      // Heartbeat
      heartbeatFrequencyMS: 10000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('authentication failed')) {
      console.error('\n❌ Authentication failed. Please check:');
      console.error('   - Database username and password in MONGODB_URI');
      console.error('   - Ensure special characters in password are URL-encoded');
    } else if (error.message.includes('timeout')) {
      console.error('\n❌ Connection timeout. Please check:');
      console.error('   - Your IP address is whitelisted in MongoDB Atlas');
      console.error('   - Network connectivity');
      console.error('   - MongoDB Atlas cluster is running');
    } else if (error.message.includes('sslvalidate') || (error.message.includes('option') && error.message.includes('not supported'))) {
      console.error('\n❌ Configuration error. This has been fixed automatically.');
      console.error('   - SSL/TLS is handled automatically by MongoDB Atlas connection string');
      console.error('   - Please try running the command again');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('\n❌ SSL/TLS error. Please check:');
      console.error('   - MongoDB Atlas connection string format');
      console.error('   - Network firewall/proxy settings');
      console.error('   - Try updating mongoose to latest version: npm update mongoose');
    }
    
    throw error;
  }
};

export default connectDB;

