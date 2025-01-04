import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { User } from '@prisma/client';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('jwt-test-secret'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user without password if user exists', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const mockPayload = {
        sub: mockUser.id,
        email: mockUser.email,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      );
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.sub },
      });
    });

    it('should return null if user does not exist', async () => {
      const mockPayload = {
        sub: 1,
        email: 'test@example.com',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await strategy.validate(mockPayload);

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayload.sub },
      });
    });
  });

  describe('constructor', () => {
    it('should use correct jwt configuration', () => {
      expect(config.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });
});
