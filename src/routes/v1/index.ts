import { Router } from 'express';
import transactionRoutes from './transaction.routes';
import userRoutes from './user.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/transactions', transactionRoutes);
router.use('/users', userRoutes);
router.use('/health', healthRoutes);

export default router;
