import { Request, Response } from 'express';
import TransactionController from '../transaction.controller';
import TransactionService from '../../service/transaction.service';
import { Transaction, TransactionStatus, Prisma } from '@prisma/client';
import { ProblemError } from '../../../../errors/ProblemError';
import { TransactionHistoryResponse } from '../../dto/transaction.dto';
import { JSendBuilderService } from '../../../../utils/jsendBuilder';

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

// Mock JSendBuilderService
jest.mock('../../../../utils/jsendBuilder', () => ({
  JSendBuilderService: {
    created: jest.fn(),
    success: jest.fn(),
    fail: jest.fn(),
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
        amount: new Prisma.Decimal(1000),
        status: TransactionStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockJSendResponse = {
        status: 'success',
        data: mockTransaction,
        message: 'Transaction created successfully',
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
      (JSendBuilderService.created as jest.Mock).mockReturnValue(
        mockJSendResponse,
      );

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(TransactionService.createTransaction).toHaveBeenCalledWith(
        'user-1',
        'user-2',
        1000,
      );
      expect(JSendBuilderService.created).toHaveBeenCalledWith(
        mockTransaction,
        'Transaction created successfully',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockJSendResponse);
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

      const mockJSendResponse = {
        status: 'success',
        data: mockHistory,
        message: 'Transactions retrieved successfully',
      };

      mockRequest = {
        query: {
          userId: 'user-1',
        },
      };

      (
        TransactionService.getTransactionsByUserId as jest.Mock
      ).mockResolvedValue(mockHistory);
      (JSendBuilderService.success as jest.Mock).mockReturnValue(
        mockJSendResponse,
      );

      await controller.getByUserId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionService.getTransactionsByUserId).toHaveBeenCalledWith(
        'user-1',
      );
      expect(JSendBuilderService.success).toHaveBeenCalledWith(
        mockHistory,
        'Transactions retrieved successfully',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockJSendResponse);
    });

    it('should fail when userId is missing', async () => {
      const mockJSendFailResponse = {
        status: 'fail',
        data: { userId: 'userId query parameter is required' },
        message: 'Missing required parameter',
      };

      mockRequest = {
        query: {},
      };

      (JSendBuilderService.fail as jest.Mock).mockReturnValue(
        mockJSendFailResponse,
      );

      await controller.getByUserId(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionService.getTransactionsByUserId).not.toHaveBeenCalled();
      expect(JSendBuilderService.fail).toHaveBeenCalledWith(
        { userId: 'userId query parameter is required' },
        'Missing required parameter',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockJSendFailResponse);
    });
  });

  describe('PATCH /transactions/:id/approve - approve', () => {
    it('should approve a transaction successfully', async () => {
      const mockTransaction: Transaction = {
        id: 'tx-123',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        amount: new Prisma.Decimal(1000),
        status: TransactionStatus.APPROVED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockJSendResponse = {
        status: 'success',
        data: mockTransaction,
        message: 'Transaction approved and processed successfully',
      };

      mockRequest = {
        params: {
          id: 'tx-123',
        },
      };

      (TransactionService.approveTransaction as jest.Mock).mockResolvedValue(
        mockTransaction,
      );
      (JSendBuilderService.success as jest.Mock).mockReturnValue(
        mockJSendResponse,
      );

      await controller.approve(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionService.approveTransaction).toHaveBeenCalledWith(
        'tx-123',
      );
      expect(JSendBuilderService.success).toHaveBeenCalledWith(
        mockTransaction,
        'Transaction approved and processed successfully',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockJSendResponse);
    });

    it('should fail when transaction id is missing', async () => {
      const mockJSendFailResponse = {
        status: 'fail',
        data: { id: 'Transaction ID is required' },
        message: 'Missing required parameter',
      };

      mockRequest = {
        params: {},
      };

      (JSendBuilderService.fail as jest.Mock).mockReturnValue(
        mockJSendFailResponse,
      );

      await controller.approve(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionService.approveTransaction).not.toHaveBeenCalled();
      expect(JSendBuilderService.fail).toHaveBeenCalledWith(
        { id: 'Transaction ID is required' },
        'Missing required parameter',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockJSendFailResponse);
    });
  });

  describe('PATCH /transactions/:id/reject - reject', () => {
    it('should reject a transaction successfully', async () => {
      const mockTransaction: Transaction = {
        id: 'tx-123',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        amount: new Prisma.Decimal(1000),
        status: TransactionStatus.REJECTED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockJSendResponse = {
        status: 'success',
        data: mockTransaction,
        message: 'Transaction rejected successfully',
      };

      mockRequest = {
        params: {
          id: 'tx-123',
        },
      };

      (TransactionService.rejectTransaction as jest.Mock).mockResolvedValue(
        mockTransaction,
      );
      (JSendBuilderService.success as jest.Mock).mockReturnValue(
        mockJSendResponse,
      );

      await controller.reject(mockRequest as Request, mockResponse as Response);

      expect(TransactionService.rejectTransaction).toHaveBeenCalledWith(
        'tx-123',
      );
      expect(JSendBuilderService.success).toHaveBeenCalledWith(
        mockTransaction,
        'Transaction rejected successfully',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockJSendResponse);
    });

    it('should fail when transaction id is missing', async () => {
      const mockJSendFailResponse = {
        status: 'fail',
        data: { id: 'Transaction ID is required' },
        message: 'Missing required parameter',
      };

      mockRequest = {
        params: {},
      };

      (JSendBuilderService.fail as jest.Mock).mockReturnValue(
        mockJSendFailResponse,
      );

      await controller.reject(mockRequest as Request, mockResponse as Response);

      expect(TransactionService.rejectTransaction).not.toHaveBeenCalled();
      expect(JSendBuilderService.fail).toHaveBeenCalledWith(
        { id: 'Transaction ID is required' },
        'Missing required parameter',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(mockJSendFailResponse);
    });
  });
});
