import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema, productQuerySchema } from '../schemas/product.schema';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(productQuerySchema), ProductController.index);
router.get('/:id', ProductController.show);
router.post('/', validateBody(createProductSchema), ProductController.store);
router.put('/:id', validateBody(updateProductSchema), ProductController.update);
router.delete('/:id', ProductController.destroy);

export default router;
