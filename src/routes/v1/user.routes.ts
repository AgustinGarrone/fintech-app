import { Router } from 'express';
import { validate } from '../../middleware/validate';
import UserController from '../../modules/user/controller/user.controller';
import { getUserBalanceParamsSchema } from '../../modules/user/validator/userValidator';

const router = Router();

/**
 * @swagger
 * /api/v1/users/{id}/balance:
 *   get:
 *     summary: Obtener saldo de un usuario
 *     description: Obtiene el saldo actual de un usuario específico
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Saldo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendSuccess'
 *             example:
 *               status: "success"
 *               data:
 *                 userId: "123e4567-e89b-12d3-a456-426614174000"
 *                 balance: 10000.50
 *               message: "Balance retrieved successfully"
 *       400:
 *         description: ID de usuario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JSendFail'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/ProblemDetails'
 */
router.get(
  '/:id/balance',
  validate(getUserBalanceParamsSchema, 'params'),
  UserController.getBalance.bind(UserController),
);

export default router;
