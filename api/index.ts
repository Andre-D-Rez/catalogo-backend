import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import database from './database/mongo.js';
import veiculoRoutes from './routes/veiculo.routes.js';
import authRoutes from './routes/auth.routes.js';
import setupSwagger from './swagger.js';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/auth', authRoutes);

// Swagger
setupSwagger(app);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Catalogo Backend API' });
});

// Connect to database (for serverless, connection happens per request)
database.connect().catch(err => {
  console.error('Database connection error:', err);
});

export default app;
