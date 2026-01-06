import { logActivity } from '@/lib/activity-log';
import { logger } from '@/lib/logger';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Helper to create a mock Request object
function createMockRequest(headers: Record<string, string> = {}): Request {
  const mockHeaders = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    mockHeaders.set(key, value);
  });

  return {
    headers: mockHeaders,
  } as unknown as Request;
}

describe('activity-log', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logActivity', () => {
    it('should create activity log with all fields', () => {
      const mockRequest = createMockRequest({
        'x-forwarded-for': '192.168.1.1',
      });

      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      const details = { photoId: 'photo-456' };

      const result = logActivity(
        'PHOTO_UPLOAD',
        '/api/photos/upload',
        'POST',
        user,
        details,
        mockRequest
      );

      expect(result).toMatchObject({
        action: 'PHOTO_UPLOAD',
        path: '/api/photos/upload',
        method: 'POST',
        userId: 'user-123',
        userEmail: 'test@example.com',
        userRole: 'USER',
        ip: '192.168.1.1',
        details: { photoId: 'photo-456' },
      });
      expect(result.timestamp).toBeDefined();
    });

    it('should handle unauthenticated users', () => {
      const result = logActivity(
        'PAGE_VIEW',
        '/photos',
        'GET',
        null,
        undefined,
        undefined
      );

      expect(result).toMatchObject({
        action: 'PAGE_VIEW',
        path: '/photos',
        method: 'GET',
        userId: undefined,
        userEmail: undefined,
        userRole: undefined,
        ip: 'unknown',
      });
    });

    it('should extract IP from x-forwarded-for header', () => {
      const mockRequest = createMockRequest({
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      });

      const result = logActivity(
        'ACTION',
        '/path',
        'GET',
        undefined,
        undefined,
        mockRequest
      );

      expect(result.ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header when x-forwarded-for is missing', () => {
      const mockRequest = createMockRequest({
        'x-real-ip': '10.0.0.1',
      });

      const result = logActivity(
        'ACTION',
        '/path',
        'GET',
        undefined,
        undefined,
        mockRequest
      );

      expect(result.ip).toBe('10.0.0.1');
    });

    it('should use "unknown" for IP when no headers are present', () => {
      const mockRequest = createMockRequest();

      const result = logActivity(
        'ACTION',
        '/path',
        'GET',
        undefined,
        undefined,
        mockRequest
      );

      expect(result.ip).toBe('unknown');
    });

    it('should call logger.info with structured data', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      const details = { photoId: 'photo-456' };

      logActivity(
        'PHOTO_UPLOAD',
        '/api/photos/upload',
        'POST',
        user,
        details
      );

      expect(logger.info).toHaveBeenCalledWith(
        'Activity: PHOTO_UPLOAD',
        expect.objectContaining({
          method: 'POST',
          path: '/api/photos/upload',
          userId: 'user-123',
          userEmail: 'test@example.com',
          userRole: 'USER',
          details: { photoId: 'photo-456' },
        })
      );
    });

    it('should not include details in logger call when details are not provided', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      logActivity(
        'PAGE_VIEW',
        '/photos',
        'GET',
        user
      );

      expect(logger.info).toHaveBeenCalledWith(
        'Activity: PAGE_VIEW',
        expect.objectContaining({
          method: 'GET',
          path: '/photos',
          userId: 'user-123',
          userEmail: 'test@example.com',
          userRole: 'USER',
        })
      );

      const callArgs = (logger.info as jest.Mock).mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('details');
    });

    it('should handle empty details object', () => {
      const result = logActivity(
        'ACTION',
        '/path',
        'GET',
        undefined,
        {}
      );

      expect(result.details).toEqual({});
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
