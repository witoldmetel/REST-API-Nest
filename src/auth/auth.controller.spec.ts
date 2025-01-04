import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            signin: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup with correct parameters', async () => {
      const dto: AuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockToken = { access_token: 'mock-token' };

      jest.spyOn(authService, 'signup').mockResolvedValue(mockToken);

      const result = await controller.signup(dto);

      expect(result).toEqual(mockToken);
      expect(authService.signup).toHaveBeenCalledWith(dto);
    });
  });

  describe('signin', () => {
    it('should call authService.signin with correct parameters', async () => {
      const dto: AuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockToken = { access_token: 'mock-token' };

      jest.spyOn(authService, 'signin').mockResolvedValue(mockToken);

      const result = await controller.signin(dto);

      expect(result).toEqual(mockToken);
      expect(authService.signin).toHaveBeenCalledWith(dto);
    });
  });
});
