import fs from 'fs';
import path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const localTimestamp = winston.format((info) => {
  info.timestamp =
    new Date()
      .toLocaleString('sv-SE', {
        timeZone: process.env.TZ || 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(' ', 'T') +
    '.' +
    String(new Date().getMilliseconds()).padStart(3, '0');
  return info;
});

// Migrate away from old log
const OLD_LOG_FILE = path.join(__dirname, '../config/logs/overseerr.log');
if (fs.existsSync(OLD_LOG_FILE)) {
  const file = fs.lstatSync(OLD_LOG_FILE);

  if (!file.isSymbolicLink()) {
    fs.unlinkSync(OLD_LOG_FILE);
  }
}

const hformat = winston.format.printf(
  ({ level, label, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]${
      label ? `[${label}]` : ''
    }: ${message} `;
    if (Object.keys(metadata).length > 0) {
      msg += JSON.stringify(metadata);
    }
    return msg;
  }
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL?.toLowerCase() || 'debug',
  format: winston.format.combine(
    winston.format.splat(),
    localTimestamp(),
    hformat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.splat(),
        localTimestamp(),
        hformat
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: process.env.CONFIG_DIRECTORY
        ? `${process.env.CONFIG_DIRECTORY}/logs/overseerr-%DATE%.log`
        : path.join(__dirname, '../config/logs/overseerr-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
      createSymlink: true,
      symlinkName: 'overseerr.log',
    }),
    new winston.transports.DailyRotateFile({
      filename: process.env.CONFIG_DIRECTORY
        ? `${process.env.CONFIG_DIRECTORY}/logs/.machinelogs-%DATE%.json`
        : path.join(__dirname, '../config/logs/.machinelogs-%DATE%.json'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '1d',
      createSymlink: true,
      symlinkName: '.machinelogs.json',
      format: winston.format.combine(
        winston.format.splat(),
        localTimestamp(),
        winston.format.json()
      ),
    }),
  ],
});

export default logger;
