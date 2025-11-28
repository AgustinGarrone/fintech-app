import { Request, Response } from 'express';
import UserService from '../service/user.service';
import { JSendBuilderService } from '../../../utils/jsendBuilder';

class UserController {
  async getBalance(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    if (!id) {
      const response = JSendBuilderService.fail(
        { id: 'User ID is required' },
        'Missing required parameter',
        { code: 400 },
      );
      return res.status(400).json(response);
    }

    const balance = await UserService.getBalance(id);

    const response = JSendBuilderService.success<{
      userId: string;
      balance: number;
    }>(
      {
        userId: id,
        balance,
      },
      'Balance retrieved successfully',
      { code: 200 },
    );
    return res.status(200).json(response);
  }
}

export default new UserController();
