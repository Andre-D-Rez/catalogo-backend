import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import fs from 'fs';
import path from 'path';

const swaggerFile = path.join(process.cwd(), 'public', 'swagger.json');
const swaggerSpec = JSON.parse(fs.readFileSync(swaggerFile, 'utf8'));

export default (app: Application) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
