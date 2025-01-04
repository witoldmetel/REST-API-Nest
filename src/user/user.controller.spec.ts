import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            editUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('userService should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the user', () => {
      const user = { id: 1, email: 'test@test.com' } as User;

      expect(controller.getMe(user)).toEqual(user);
    });
  });

  describe('editUser', () => {
    it('should call userService.editUser with correct parameters', async () => {
      const userId = 1;
      const dto = { firstName: 'John', lastName: 'Doe' };

      await controller.editUser(userId, dto);
      expect(userService.editUser).toHaveBeenCalledWith(userId, dto);
    });
  });
});
