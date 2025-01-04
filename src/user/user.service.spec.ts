import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto/edit-user.dto';
import { User } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn(),
            },
            cleanDb: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get(PrismaService);
    await prisma.cleanDb();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('editUser', () => {
    it('should edit a user and return the updated user without password', async () => {
      const userId = 1;
      const dto: EditUserDto = {
        firstName: 'Joe',
        email: 'newemail@example.com',
      };
      const updatedUser = {
        id: userId,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'newemail@example.com',
        password: 'hashed-password',
      } as User;

      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.editUser(userId, dto);

      expect(result).toEqual({
        id: userId,
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'newemail@example.com',
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { ...dto },
      });
    });

    it('should throw an error if user not found', async () => {
      const userId = 1;
      const dto: EditUserDto = {
        firstName: 'New Name',
        email: 'newemail@example.com',
      };

      jest
        .spyOn(prisma.user, 'update')
        .mockRejectedValue(new Error('User not found'));

      await expect(service.editUser(userId, dto)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
