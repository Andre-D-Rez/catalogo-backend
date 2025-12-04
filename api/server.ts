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

// Start server
const startServer = async () => {
  try {
    await database.connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
