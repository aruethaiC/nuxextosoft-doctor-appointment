import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import CookieParser from 'cookie-parser';
import httpStatus from 'http-status';
import ApiError from './errors/apiError';
import router from './app/routes';
import config from './config';
import logger from './logger';
import { correlationIdMiddleware } from './correlation-id-middleware';
import { register, httpRequestDurationMicroseconds } from './metrics';
import initTracing from './tracing';

const app: Application = express();
const tracer = initTracing('example-app'); // Replace 'example-app' with your service name

app.use(cors());
app.use(CookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Use correlation ID middleware
app.use(correlationIdMiddleware);

// Middleware to start tracing each request
app.use((req: Request, res: Response, next: NextFunction) => {
  const span = tracer.startSpan(`HTTP ${req.method} ${req.url}`);
  res.on('finish', () => {
    span.setAttributes({
      'http.method': req.method,
      'http.url': req.url,
      'http.status_code': res.statusCode,
      'correlation_id': req.headers['x-correlation-id'] || 'none'
    });
    span.end();
  });
  next();
});

// Middleware to log request duration and record metrics
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(durationInMilliseconds);
    logger.info(`Request to ${req.method} ${req.originalUrl} took ${durationInMilliseconds.toFixed(2)}ms`);
  });

  next();
});

// Helper function to calculate request duration in milliseconds
const getDurationInMilliseconds = (start: [number, number]): number => {
  const [seconds, nanoseconds] = process.hrtime(start);
  return seconds * 1000 + nanoseconds / 1e6;
};

app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end();
});

app.get('/', (req: Request, res: Response) => {
  res.send(config.clientUrl);
});

app.use('/api/v1', router);

// Metrics endpoint
app.get('/metrics', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
  } else {
    res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'Something Went Wrong',
    });
  }
  next();
});

export default app;