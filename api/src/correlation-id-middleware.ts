import { v4 as uuidv4 } from 'uuid';
import * as cls from 'cls-hooked';
import { Request, Response, NextFunction } from 'express';

const session = cls.createNamespace('myNamespace');

const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  session.run(() => {
    session.set('correlationId', correlationId);
    res.setHeader('x-correlation-id', correlationId);
    next();
  });
};

const getCorrelationId = (): string | undefined => {
  return session.get('correlationId');
};

export { correlationIdMiddleware, getCorrelationId };