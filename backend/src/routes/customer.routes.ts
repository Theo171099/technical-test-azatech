import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { createCustomerSchema, updateCustomerSchema, customerQuerySchema } from '../schemas/customer.schema';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(customerQuerySchema), CustomerController.index);
router.get('/:id', CustomerController.show);
router.post('/', validateBody(createCustomerSchema), CustomerController.store);
router.put('/:id', validateBody(updateCustomerSchema), CustomerController.update);
router.delete('/:id', CustomerController.destroy);

export default router;
