import winston from 'winston';

const { combine, timestamp, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  format: combine(timestamp({ format: 'DD-MM-YYYY, hh:mm:ss A' }), json()),
});

if (process.env.NODE_ENV == 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  );
} else {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    }),
  );
}

export { logger };
