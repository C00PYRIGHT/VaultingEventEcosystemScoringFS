import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info', // alapértelmezett log szint

  format: format.combine(
    
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize({ all: true }), 
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
  ],
});
const dblogger = createLogger({
  level: 'info', // alapértelmezett log szint

  format: format.combine(
    
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize({ all: true }), 
    format.printf(({ timestamp, level, message }) => {
      return ` DB MODIED: ${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
  ],
});

export default{ logger, dblogger };
