import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../config/env';

// ─── ANSI Colours for Console ─────────────────────────────────────────────────
const COLOURS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
} as const;

winston.addColors(COLOURS);

// ─── Custom Format Pieces ─────────────────────────────────────────────────────
const timestamp = winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' });
const errors = winston.format.errors({ stack: true });

/** Adds `service` and `environment` fields to every log entry. */
const metadata = winston.format((info) => {
  info['service'] = env.APP_NAME;
  info['environment'] = env.NODE_ENV;
  return info;
});

// ─── Console Format (colourised, human-readable) ──────────────────────────────
const consoleFormat = winston.format.combine(
  timestamp,
  errors,
  metadata(),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ level, message, timestamp: ts, stack, requestId, userId, ...rest }) => {
    const meta: string[] = [];
    if (requestId) meta.push(`reqId=${requestId}`);
    if (userId) meta.push(`userId=${userId}`);

    const extras = Object.keys(rest).filter(
      (k) => !['service', 'environment'].includes(k),
    );
    if (extras.length) meta.push(JSON.stringify(Object.fromEntries(extras.map((k) => [k, rest[k]]))));

    const metaStr = meta.length ? ` [${meta.join(' | ')}]` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `[${ts as string}] ${level}${metaStr}: ${message as string}${stackStr}`;
  }),
);

// ─── File Format (structured JSON) ───────────────────────────────────────────
const fileFormat = winston.format.combine(
  timestamp,
  errors,
  metadata(),
  winston.format.json(),
);

// ─── Transports ───────────────────────────────────────────────────────────────
const logDir = path.resolve(process.cwd(), env.LOG_DIR);

const transports: winston.transport[] = [
  // Always write to console
  new winston.transports.Console({ format: consoleFormat }),
];

if (!env.isTest) {
  // Combined log (all levels)
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: env.LOG_MAX_SIZE,
      maxFiles: env.LOG_MAX_FILES,
      format: fileFormat,
      level: env.LOG_LEVEL,
      zippedArchive: true,
    }),
  );

  // Error log (errors only)
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: env.LOG_MAX_SIZE,
      maxFiles: env.LOG_MAX_FILES,
      format: fileFormat,
      level: 'error',
      zippedArchive: true,
    }),
  );

  // HTTP access log
  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: env.LOG_MAX_SIZE,
      maxFiles: env.LOG_MAX_FILES,
      format: fileFormat,
      level: 'http',
      zippedArchive: true,
    }),
  );
}

// ─── Logger Instance ──────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels: winston.config.npm.levels,
  defaultMeta: { service: env.APP_NAME },
  transports,
  // Don't exit on error
  exitOnError: false,
  // Catch unhandled exceptions / rejections
  exceptionHandlers: env.isTest
    ? []
    : [
        new DailyRotateFile({
          dirname: logDir,
          filename: 'exceptions-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: env.LOG_MAX_SIZE,
          maxFiles: env.LOG_MAX_FILES,
          format: fileFormat,
          zippedArchive: true,
        }),
      ],
  rejectionHandlers: env.isTest
    ? []
    : [
        new DailyRotateFile({
          dirname: logDir,
          filename: 'rejections-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: env.LOG_MAX_SIZE,
          maxFiles: env.LOG_MAX_FILES,
          format: fileFormat,
          zippedArchive: true,
        }),
      ],
});

// ─── Child Logger Factory ─────────────────────────────────────────────────────
/**
 * Create a child logger that automatically includes module-level metadata.
 *
 * @example
 * const log = createModuleLogger('AuthService');
 * log.info('User logged in', { userId: '123' });
 */
export function createModuleLogger(module: string): winston.Logger {
  return logger.child({ module });
}

// ─── HTTP Stream (for Morgan) ─────────────────────────────────────────────────
export const httpLogStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};
