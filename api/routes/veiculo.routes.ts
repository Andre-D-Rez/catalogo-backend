import { Router } from 'express';
import controller from '../controllers/veiculo.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Rotas protegidas - apenas admin pode criar, editar e deletar
router.post('/', requireAuth, requireAdmin, controller.create);
router.put('/:id', requireAuth, requireAdmin, controller.update);
router.delete('/:id', requireAuth, requireAdmin, controller.delete);

// Rotas públicas - qualquer um pode ver
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

export default router;
