import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import database from './database/mongo.js';
import veiculoRoutes from './routes/veiculo.routes.js';
import authRoutes from './routes/auth.routes.js';
import setupStaticSwagger from './static-swagger.js';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para conectar ao DB antes de processar requests (opcional)
app.use(async (req, res, next) => {
  try {
    await database.connect();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    // Continua sem bloquear - permite desenvolvimento sem DB
    next();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Catalogo Backend API' });
});

// Routes
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/auth', authRoutes);

// Swagger
setupStaticSwagger(app);

// Error handler global
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

export default app;
