import 'dotenv/config';
import mongoose from 'mongoose';

let isConnected = false;

const connect = async (): Promise<void> => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  mongoose.set('strictQuery', true);
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined in environment variables.');
  
  try {
    await mongoose.connect(MONGODB_URI, { 
      dbName: process.env.MONGODB_DB_NAME || 'example',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export default { connect };