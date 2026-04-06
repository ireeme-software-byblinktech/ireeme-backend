import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, json, errors, colorize, printf } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';

// ─── Log level ───────────────────────────────────────────────────────────────
// dev: debug (everything)    prod: warn (warn + error only)
const logLevel = isProduction ? 'warn' : 'debug';

// ─── Formats ─────────────────────────────────────────────────────────────────
const jsonFormat = combine(
  errors({ stack: true }), // capture stack traces in the log meta
  timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  json(),
);

const devConsoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp, context, requestId, ...meta }) => {
    const ctx = context ? ` [${context}]` : '';
    const rid = requestId ? ` {${requestId}}` : '';
    const extra = Object.keys(meta).length ? `\n  ${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp}${ctx}${rid} ${level}: ${message}${extra}`;
  }),
);

// ─── Transports ──────────────────────────────────────────────────────────────
const transports: winston.transport[] = [
  // Console
  new winston.transports.Console({
    level: logLevel,
    format: isProduction ? jsonFormat : devConsoleFormat,
  }),

  // Errors only — daily rotation, keep 30 days
  new winston.transports.DailyRotateFile({
    level: 'error',
    dirname: 'logs',
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    zippedArchive: true,
    format: jsonFormat,
  }),

  // All levels — daily rotation, keep 14 days
  new winston.transports.DailyRotateFile({
    level: logLevel,
    dirname: 'logs',
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    zippedArchive: true,
    format: jsonFormat,
  }),
];

export const winstonConfig: winston.LoggerOptions = {
  level: logLevel,
  transports,
  // Don't crash the app on logger failures
  exitOnError: false,
};
