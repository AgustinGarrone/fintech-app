import { Request, Response } from 'express';
import TransactionController from '../transaction.controller';
import TransactionService from '../../service/transaction.service';
import { Transaction, TransactionStatus } from '@prisma/client';
import { ProblemError } from '../../../../errors/ProblemError';
import { TransactionHistoryResponse } from '../../dto/transaction.dto';

// Mock TransactionService
jest.mock('../../service/transaction.service', () => ({
  __esModule: true,
  default: {
    createTransaction: jest.fn(),
    getTransactionsByUserId: jest.fn(),
    approveTransaction: jest.fn(),
    rejectTransaction: jest.fn(),
  },
}));

describe('TransactionController', () => {
  let controller: typeof TransactionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = TransactionController;

    // Mock Response object
    mockResponse = {
      jsendCreated: jest.fn().mockReturnThis(),
      jsendSuccess: jest.fn().mockReturnThis(),
      jsendFail: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
  });

  describe('POST /transactions - create', () => {
    it('should create a transaction successfully', async () => {
      const mockTransaction: Transaction = {
        id: 'tx-123',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        amount: new (require('@prisma/client').Prisma.Decimal)(1000),
        status: TransactionStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest = {
        body: {
          fromUserId: 'user-1',
          toUserId: 'user-2',
          amount: 1000,
        },
      };

      (TransactionService.createTransaction as jest.Mock).mockResolvedValue(
        mockTransaction,
      );

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(TransactionService.createTransaction).toHaveBeenCalledWith(
        'user-1',
        'user-2',
        1000,
      );
      expect(mockResponse.jsendCreated).toHaveBeenCalledWith(
        mockTransaction,
        'Transaction created successfully',
      );
    });

    it('should fail when validation error occurs', async () => {
      mockRequest = {
        body: {
          fromUserId: 'user-1',
          toUserId: 'user-2',
          amount: -100, // Invalid amount
        },
      };

      (TransactionService.createTransaction as jest.Mock).mockRejectedValue(
        ProblemError.badRequest('Amount must be positive'),
      );

      await expect(
        controller.create(mockRequest as Request, mockResponse as Response),
      ).rejects.toThrow(ProblemError);

      expect(TransactionService.createTransaction).toHaveBeenCalled();
    });
  });

  describe('GET /transactions?userId=... - getByUserId', () => {
    it('should get transactions by userId successfully', async () => {
      const mockHistory: TransactionHistoryResponse = {
        userId: 'user-1',
        sentTransactions: [],
        receivedTransactions: [],
      };

      mockRequest = {
        query: {
          userId: 'user-1',
        },
      };

      (
        TransactionService.getTransactionsByUserId as jest.Mock
      ).mockResolvedValue(mockHistory);

      await controller.getByUserId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionService.getTransactionsByUserId).toHaveBeenCalledWith(
        'user-1',
      );
      expect(mockResponse.jsendSuccess).toHaveBeenCalledWith(
        mockHistory,
        200,
        'Transactions retrieved successfully',
      );
    });

    it('should fail when userId is missing', async () => {
      mockRequest = {
        query: {},
      };

      await controller.getByUserId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionService.getTransactionsByUserId).not.toHaveBeenCalled();
      expect(mockResponse.jsendFail).toHaveBeenCalledWith(
        { userId: 'userId query parameter is required' },
        'Missing required parameter',
        400,
      );
    });
  });

  describe('PATCH /transactions/:id/approve - approve', () => {
    it('should approve a transaction successfully', async () => {
      const mockTransaction: Transaction = {
        id: 'tx-123',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        amount: new (require('@prisma/client').Prisma.Decimal)(1000),
        status: TransactionStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest = {
        params: {
          id: 'tx-123',
        },
      };

      (TransactionService.approveTransaction as jest.Mock).mockResolvedValue(
        mockTransaction,
      );

      await controller.approve(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionService.approveTransaction).toHaveBeenCalledWith(
        'tx-123',
      );
      expect(mockResponse.jsendSuccess).toHaveBeenCalledWith(
        mockTransaction,
        200,
        'Transaction approved and processed successfully',
      );
    });

    it('should fail when transaction id is missing', async () => {
      mockRequest = {
        params: {},
      };

      await controller.approve(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionService.approveTransaction).not.toHaveBeenCalled();
      expect(mockResponse.jsendFail).toHaveBeenCalledWith(
        { id: 'Transaction ID is required' },
        'Missing required parameter',
        400,
      );
    });
  });

  describe('PATCH /transactions/:id/reject - reject', () => {
    it('should reject a transaction successfully', async () => {
      const mockTransaction: Transaction = {
        id: 'tx-123',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        amount: new (require('@prisma/client').Prisma.Decimal)(1000),
        status: TransactionStatus.REJECTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest = {
        params: {
          id: 'tx-123',
        },
      };

      (TransactionService.rejectTransaction as jest.Mock).mockResolvedValue(
        mockTransaction,
      );

      await controller.reject(mockRequest as Request, mockResponse as Response);

      expect(TransactionService.rejectTransaction).toHaveBeenCalledWith(
        'tx-123',
      );
      expect(mockResponse.jsendSuccess).toHaveBeenCalledWith(
        mockTransaction,
        200,
        'Transaction rejected successfully',
      );
    });

    it('should fail when transaction id is missing', async () => {
      mockRequest = {
        params: {},
      };

      await controller.reject(mockRequest as Request, mockResponse as Response);

      expect(TransactionService.rejectTransaction).not.toHaveBeenCalled();
      expect(mockResponse.jsendFail).toHaveBeenCalledWith(
        { id: 'Transaction ID is required' },
        'Missing required parameter',
        400,
      );
    });
  });
});
