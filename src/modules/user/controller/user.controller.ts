import { Request, Response } from 'express';
import UserService from '../service/user.service';

class UserController {
  async getBalance(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id) {
      res.jsendFail(
        { id: 'User ID is required' },
        'Missing required parameter',
        400,
      );
      return;
    }

    const balance = await UserService.getBalance(id);

    res.jsendSuccess<{ userId: string; balance: number }>(
      {
        userId: id,
        balance,
      },
      200,
      'Balance retrieved successfully',
    );
  }
}

export default new UserController();
