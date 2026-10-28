import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema, refreshTokenSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.post('/refresh', validateBody(refreshTokenSchema), AuthController.refresh);

export default router;
