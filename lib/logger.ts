/**
 * Structured logging utility with log levels and environment-based filtering
 * 
 * Log levels (in order of severity):
 * - DEBUG: Detailed information for debugging (only in development)
 * - INFO: General informational messages
 * - WARN: Warning messages for potentially harmful situations
 * - ERROR: Error messages for error events
 * 
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.debug('Debug message', { data })
 *   logger.info('Info message', { data })
 *   logger.warn('Warning message', { data })
 *   logger.error('Error message', { error })
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4, // Disable all logging
}

export interface LogContext {
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext | Error): void;
  isLevelEnabled(level: LogLevel): boolean;
}

/**
 * Parse log level from environment variable or default based on NODE_ENV
 */
function getLogLevel(): LogLevel {
  const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
  
  // If explicitly set, use that
  if (envLogLevel) {
    switch (envLogLevel) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      case 'NONE':
        return LogLevel.NONE;
      default:
        // Invalid value, fall through to default behavior
        break;
    }
  }
  
  // Default behavior: DEBUG in development, INFO in production
  return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
}

/**
 * Format log entry as structured JSON or human-readable string
 */
function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext | Error
): string {
  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];
  
  // If structured logging is enabled, output JSON
  if (process.env.LOG_FORMAT === 'json') {
    const logEntry: Record<string, unknown> = {
      timestamp,
      level: levelName,
      message,
    };
    
    if (context) {
      if (context instanceof Error) {
        logEntry.error = {
          name: context.name,
          message: context.message,
          stack: context.stack,
        };
      } else {
        Object.assign(logEntry, context);
      }
    }
    
    return JSON.stringify(logEntry);
  }
  
  // Human-readable format
  const contextStr = context
    ? context instanceof Error
      ? ` | Error: ${context.name}: ${context.message}`
      : ` | ${JSON.stringify(context)}`
    : '';
  
  return `[${levelName}] ${timestamp} | ${message}${contextStr}`;
}

/**
 * Create a logger instance with the configured log level
 */
function createLogger(): Logger {
  const currentLevel = getLogLevel();
  
  const shouldLog = (level: LogLevel): boolean => {
    return level >= currentLevel;
  };
  
  return {
    debug(message: string, context?: LogContext): void {
      if (shouldLog(LogLevel.DEBUG)) {
        console.log(formatLog(LogLevel.DEBUG, message, context));
      }
    },
    
    info(message: string, context?: LogContext): void {
      if (shouldLog(LogLevel.INFO)) {
        console.log(formatLog(LogLevel.INFO, message, context));
      }
    },
    
    warn(message: string, context?: LogContext): void {
      if (shouldLog(LogLevel.WARN)) {
        console.warn(formatLog(LogLevel.WARN, message, context));
      }
    },
    
    error(message: string, context?: LogContext | Error): void {
      if (shouldLog(LogLevel.ERROR)) {
        console.error(formatLog(LogLevel.ERROR, message, context));
      }
    },
    
    isLevelEnabled(level: LogLevel): boolean {
      return shouldLog(level);
    },
  };
}

// Export singleton logger instance
export const logger = createLogger();

// Export for testing
export { getLogLevel, formatLog, createLogger };
