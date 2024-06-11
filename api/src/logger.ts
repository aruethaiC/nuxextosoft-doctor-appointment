import { createLogger, format, transports } from 'winston';
import { getCorrelationId } from './correlation-id-middleware';

const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp }) => {
  const correlationId = getCorrelationId();
  const correlationIdStr = correlationId ? `[${correlationId}]` : '';
  return `${timestamp} ${correlationIdStr} [${level}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    customFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

export default logger;