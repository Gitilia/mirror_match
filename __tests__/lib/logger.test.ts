import { logger, LogLevel, getLogLevel, formatLog, createLogger } from '@/lib/logger';

// Mock console methods
const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('Logger', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = mockConsole.log;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;
    // Reset environment variables
    process.env = { ...originalEnv };
    // Use type assertion to allow deletion
    delete (process.env as { LOG_LEVEL?: string }).LOG_LEVEL;
    delete (process.env as { LOG_FORMAT?: string }).LOG_FORMAT;
    delete (process.env as { NODE_ENV?: string }).NODE_ENV;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('getLogLevel', () => {
    it('should return DEBUG when LOG_LEVEL=DEBUG', () => {
      process.env.LOG_LEVEL = 'DEBUG';
      expect(getLogLevel()).toBe(LogLevel.DEBUG);
    });

    it('should return INFO when LOG_LEVEL=INFO', () => {
      process.env.LOG_LEVEL = 'INFO';
      expect(getLogLevel()).toBe(LogLevel.INFO);
    });

    it('should return WARN when LOG_LEVEL=WARN', () => {
      process.env.LOG_LEVEL = 'WARN';
      expect(getLogLevel()).toBe(LogLevel.WARN);
    });

    it('should return ERROR when LOG_LEVEL=ERROR', () => {
      process.env.LOG_LEVEL = 'ERROR';
      expect(getLogLevel()).toBe(LogLevel.ERROR);
    });

    it('should return NONE when LOG_LEVEL=NONE', () => {
      process.env.LOG_LEVEL = 'NONE';
      expect(getLogLevel()).toBe(LogLevel.NONE);
    });

    it('should default to DEBUG in development', () => {
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'development';
      expect(getLogLevel()).toBe(LogLevel.DEBUG);
    });

    it('should default to INFO in production', () => {
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
      expect(getLogLevel()).toBe(LogLevel.INFO);
    });

    it('should ignore invalid LOG_LEVEL values and use defaults', () => {
      (process.env as { LOG_LEVEL?: string }).LOG_LEVEL = 'INVALID';
      (process.env as { NODE_ENV?: string }).NODE_ENV = 'production';
      expect(getLogLevel()).toBe(LogLevel.INFO);
    });
  });

  describe('formatLog', () => {
    it('should format log in human-readable format by default', () => {
      const result = formatLog(LogLevel.INFO, 'Test message', { key: 'value' });
      expect(result).toContain('[INFO]');
      expect(result).toContain('Test message');
      expect(result).toContain('{"key":"value"}');
    });

    it('should format log as JSON when LOG_FORMAT=json', () => {
      process.env.LOG_FORMAT = 'json';
      const result = formatLog(LogLevel.INFO, 'Test message', { key: 'value' });
      const parsed = JSON.parse(result);
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message');
      expect(parsed.key).toBe('value');
      expect(parsed.timestamp).toBeDefined();
    });

    it('should format Error objects correctly', () => {
      const error = new Error('Test error');
      const result = formatLog(LogLevel.ERROR, 'Error occurred', error);
      expect(result).toContain('[ERROR]');
      expect(result).toContain('Error occurred');
      expect(result).toContain('Error: Error: Test error');
    });

    it('should format Error objects as JSON when LOG_FORMAT=json', () => {
      process.env.LOG_FORMAT = 'json';
      const error = new Error('Test error');
      const result = formatLog(LogLevel.ERROR, 'Error occurred', error);
      const parsed = JSON.parse(result);
      expect(parsed.level).toBe('ERROR');
      expect(parsed.message).toBe('Error occurred');
      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Test error');
      expect(parsed.error.stack).toBeDefined();
    });

    it('should handle logs without context', () => {
      const result = formatLog(LogLevel.INFO, 'Simple message');
      expect(result).toContain('[INFO]');
      expect(result).toContain('Simple message');
      // Format always includes pipe separator, but no context data after it
      expect(result).toContain('|');
      expect(result.split('|').length).toBe(2); // timestamp | message (no context)
    });
  });

  describe('Logger instance', () => {
    it('should log DEBUG messages when level is DEBUG', () => {
      process.env.LOG_LEVEL = 'DEBUG';
      const testLogger = createLogger();
      testLogger.debug('Debug message', { data: 'test' });
      expect(mockConsole.log).toHaveBeenCalled();
    });

    it('should not log DEBUG messages when level is INFO', () => {
      process.env.LOG_LEVEL = 'INFO';
      const testLogger = createLogger();
      testLogger.debug('Debug message');
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it('should log INFO messages when level is INFO', () => {
      process.env.LOG_LEVEL = 'INFO';
      const testLogger = createLogger();
      testLogger.info('Info message');
      expect(mockConsole.log).toHaveBeenCalled();
    });

    it('should log WARN messages when level is WARN', () => {
      process.env.LOG_LEVEL = 'WARN';
      const testLogger = createLogger();
      testLogger.warn('Warning message');
      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it('should not log INFO messages when level is WARN', () => {
      process.env.LOG_LEVEL = 'WARN';
      const testLogger = createLogger();
      testLogger.info('Info message');
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it('should log ERROR messages when level is ERROR', () => {
      process.env.LOG_LEVEL = 'ERROR';
      const testLogger = createLogger();
      testLogger.error('Error message');
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should not log any messages when level is NONE', () => {
      process.env.LOG_LEVEL = 'NONE';
      const testLogger = createLogger();
      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warning message');
      testLogger.error('Error message');
      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should handle Error objects in error method', () => {
      process.env.LOG_LEVEL = 'ERROR';
      const testLogger = createLogger();
      const error = new Error('Test error');
      testLogger.error('Error occurred', error);
      expect(mockConsole.error).toHaveBeenCalled();
      const callArgs = mockConsole.error.mock.calls[0][0];
      expect(callArgs).toContain('Error occurred');
    });

    it('isLevelEnabled should return correct values', () => {
      process.env.LOG_LEVEL = 'WARN';
      const testLogger = createLogger();
      expect(testLogger.isLevelEnabled(LogLevel.DEBUG)).toBe(false);
      expect(testLogger.isLevelEnabled(LogLevel.INFO)).toBe(false);
      expect(testLogger.isLevelEnabled(LogLevel.WARN)).toBe(true);
      expect(testLogger.isLevelEnabled(LogLevel.ERROR)).toBe(true);
    });
  });

  describe('Default logger instance', () => {
    it('should be available and functional', () => {
      process.env.LOG_LEVEL = 'INFO';
      logger.info('Test message');
      expect(mockConsole.log).toHaveBeenCalled();
    });
  });
});
