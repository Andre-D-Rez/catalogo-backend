import 'dotenv/config';
import mongoose from 'mongoose';

const connect = async (): Promise<void> => {
  mongoose.set('strictQuery', true);
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined in environment variables.');
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'example' });
  console.log('Database connection successful');
};

export default { connect };