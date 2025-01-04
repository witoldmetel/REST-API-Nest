import { UnauthorizedException } from '@nestjs/common';
import { JwtGuard } from './jwt.guard';

describe('JwtGuard', () => {
  let guard: JwtGuard;

  beforeEach(() => {
    guard = new JwtGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user if no errors and user exists', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if error exists', () => {
      const mockError = new Error('Test error');

      expect(() => guard.handleRequest(mockError, null, null)).toThrow(
        mockError,
      );
    });

    it('should throw UnauthorizedException if no user', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if info exists', () => {
      const mockInfo = { message: 'Token expired' };

      expect(() => guard.handleRequest(null, null, mockInfo)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
