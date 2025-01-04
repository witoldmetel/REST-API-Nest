import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            cleanDb: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
    await prisma.cleanDb();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('config should be defined', () => {
    expect(config).toBeDefined();
  });

  describe('signup', () => {
    const dto: AuthDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should create a new user and return access token', async () => {
      const hashedPassword = 'hashed-password';
      const mockUser = {
        id: 1,
        email: dto.email,
        password: hashedPassword,
      } as User;
      const mockToken = 'mock-token';

      (argon.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'signAsync').mockResolvedValue(mockToken);

      const result = await service.signup(dto);

      expect(result).toEqual({ access_token: mockToken });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      });
    });

    it('should throw ForbiddenException if email exists', async () => {
      jest.spyOn(prisma.user, 'create').mockRejectedValue(
        new PrismaClientKnownRequestError('', {
          code: 'P2002',
          clientVersion: '2.0.0',
        }),
      );

      await expect(service.signup(dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('signin', () => {
    const dto: AuthDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token for valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: dto.email,
        password: 'hashed-password',
      } as User;
      const mockToken = 'mock-token';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwt, 'signAsync').mockResolvedValue(mockToken);

      const result = await service.signin(dto);

      expect(result).toEqual({ access_token: mockToken });
    });

    it('should throw ForbiddenException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.signin(dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        email: dto.email,
        password: 'hashed-password',
      } as User;

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.signin(dto)).rejects.toThrow(ForbiddenException);
    });
  });
});
