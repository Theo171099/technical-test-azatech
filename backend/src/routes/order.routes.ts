import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { createOrderSchema, orderQuerySchema } from '../schemas/order.schema';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(orderQuerySchema), OrderController.index);
router.get('/:id', OrderController.show);
router.post('/', validateBody(createOrderSchema), OrderController.store);

export default router;
