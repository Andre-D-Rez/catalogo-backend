import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Catálogo Backend API',
      version: '1.0.0',
      description: 'Documentação da API do Catálogo de Veículos',
    },
    servers: [
      { url: 'http://localhost:3000' },
    ],
  },
  apis: ['./api/routes/*.ts', './api/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default (app: Application) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
