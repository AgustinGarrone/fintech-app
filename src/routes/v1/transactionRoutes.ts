import { Router } from 'express';
import { validate } from '../../middleware/validate';
import TransactionController from '../../modules/transaction/controller/transaction.controller';
import {
  createTransactionSchema,
  getTransactionsQuerySchema,
} from '../../modules/transaction/validator/transactionValidator';

const router = Router();

router.post(
  '/',
  validate(createTransactionSchema),
  TransactionController.create.bind(TransactionController),
);

router.get(
  '/',
  validate(getTransactionsQuerySchema, 'query'),
  TransactionController.getByUserId.bind(TransactionController),
);

router.patch(
  '/:id/approve',
  TransactionController.approve.bind(TransactionController),
);

router.patch(
  '/:id/reject',
  TransactionController.reject.bind(TransactionController),
);

export default router;
