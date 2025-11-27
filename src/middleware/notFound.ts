import { Request, Response } from 'express';
import { ProblemError } from '../errors/ProblemError';

export const notFound = (req: Request, res: Response) => {
  const problem = ProblemError.notFound(`Route ${req.originalUrl} not found`, {
    instance: req.originalUrl,
  });

  res.status(problem.status);
  res.setHeader('Content-Type', 'application/problem+json');
  res.json(problem.toJSON());
};
