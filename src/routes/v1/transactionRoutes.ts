import { Router } from 'express';
import { validate } from '../../middleware/validate';
import TransactionController from '../../modules/transaction/controller/transaction.controller';
import {
  createTransactionSchema,
  getTransactionsQuerySchema,
} from '../../modules/transaction/validator/transactionValidator';

const router = Router();

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Crear una nueva transacción
 *     description: Crea una transacción entre dos usuarios. Si el monto es mayor a 50,000, queda pendiente para aprobación manual. Si es menor o igual, se aprueba automáticamente.
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransactionRequest'
 *           example:
 *             fromUserId: "123e4567-e89b-12d3-a456-426614174000"
 *             toUserId: "123e4567-e89b-12d3-a456-426614174001"
 *             amount: 1000.50
 *     responses:
 *       201:
 *         description: Transacción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *             example:
 *               status: "success"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174002"
 *                 fromUserId: "123e4567-e89b-12d3-a456-426614174000"
 *                 toUserId: "123e4567-e89b-12d3-a456-426614174001"
 *                 amount: 1000.50
 *                 status: "APPROVED"
 *                 createdAt: "2025-01-27T10:00:00Z"
 *                 updatedAt: "2025-01-27T10:00:00Z"
 *               message: "Transaction created successfully"
 *       400:
 *         description: Error de validación o saldo insuficiente
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 */
router.post(
  '/',
  validate(createTransactionSchema),
  TransactionController.create.bind(TransactionController),
);

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Obtener transacciones de un usuario
 *     description: Lista todas las transacciones (enviadas y recibidas) de un usuario, ordenadas por fecha descendente
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Lista de transacciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *             example:
 *               status: "success"
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174002"
 *                   fromUserId: "123e4567-e89b-12d3-a456-426614174000"
 *                   toUserId: "123e4567-e89b-12d3-a456-426614174001"
 *                   amount: 1000.50
 *                   status: "APPROVED"
 *                   createdAt: "2025-01-27T10:00:00Z"
 *                   updatedAt: "2025-01-27T10:00:00Z"
 *                   fromUser:
 *                     id: "123e4567-e89b-12d3-a456-426614174000"
 *                     name: "Usuario Origen"
 *                     email: "origen@example.com"
 *                   toUser:
 *                     id: "123e4567-e89b-12d3-a456-426614174001"
 *                     name: "Usuario Destino"
 *                     email: "destino@example.com"
 *               message: "Transactions retrieved successfully"
 *       400:
 *         description: Parámetro userId faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 */
router.get(
  '/',
  validate(getTransactionsQuerySchema, 'query'),
  TransactionController.getByUserId.bind(TransactionController),
);

/**
 * @swagger
 * /api/v1/transactions/{id}/approve:
 *   patch:
 *     summary: Aprobar una transacción pendiente
 *     description: Aprueba una transacción pendiente, procesa el movimiento de fondos y actualiza el estado a APPROVED. Solo funciona si el estado actual es PENDING.
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la transacción
 *         example: "123e4567-e89b-12d3-a456-426614174002"
 *     responses:
 *       200:
 *         description: Transacción aprobada y procesada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *             example:
 *               status: "success"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174002"
 *                 fromUserId: "123e4567-e89b-12d3-a456-426614174000"
 *                 toUserId: "123e4567-e89b-12d3-a456-426614174001"
 *                 amount: 1000.50
 *                 status: "APPROVED"
 *                 createdAt: "2025-01-27T10:00:00Z"
 *                 updatedAt: "2025-01-27T10:00:00Z"
 *               message: "Transaction approved and processed successfully"
 *       400:
 *         description: La transacción no está pendiente o saldo insuficiente
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 *       404:
 *         description: Transacción no encontrada
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 */
router.patch(
  '/:id/approve',
  TransactionController.approve.bind(TransactionController),
);

/**
 * @swagger
 * /api/v1/transactions/{id}/reject:
 *   patch:
 *     summary: Rechazar una transacción pendiente
 *     description: Rechaza una transacción pendiente y cambia su estado a REJECTED. No modifica los saldos de los usuarios. Solo funciona si el estado actual es PENDING.
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la transacción
 *         example: "123e4567-e89b-12d3-a456-426614174002"
 *     responses:
 *       200:
 *         description: Transacción rechazada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *             example:
 *               status: "success"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174002"
 *                 fromUserId: "123e4567-e89b-12d3-a456-426614174000"
 *                 toUserId: "123e4567-e89b-12d3-a456-426614174001"
 *                 amount: 1000.50
 *                 status: "REJECTED"
 *                 createdAt: "2025-01-27T10:00:00Z"
 *                 updatedAt: "2025-01-27T10:00:00Z"
 *               message: "Transaction rejected successfully"
 *       400:
 *         description: La transacción no está pendiente
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 *       404:
 *         description: Transacción no encontrada
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 */
router.patch(
  '/:id/reject',
  TransactionController.reject.bind(TransactionController),
);

export default router;
