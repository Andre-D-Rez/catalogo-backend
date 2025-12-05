import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import database from './database/mongo.js';
import veiculoRoutes from './routes/veiculo.routes.js';
import authRoutes from './routes/auth.routes.js';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Catalogo Backend API' });
});

// Connect to database (optional for development)
try {
  await database.connect();
} catch (err) {
  console.error('Database connection error:', err);
  console.warn('⚠️  Server starting without database');
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`💊 Health check: http://localhost:${PORT}/health`);
});

export default app;
