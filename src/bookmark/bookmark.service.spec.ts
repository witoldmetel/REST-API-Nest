import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkService } from './bookmark.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { Bookmark } from '@prisma/client';

describe('BookmarkService', () => {
  let service: BookmarkService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarkService,
        {
          provide: PrismaService,
          useValue: {
            bookmark: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            cleanDb: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BookmarkService>(BookmarkService);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.cleanDb();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBookmarks', () => {
    it('should return array of bookmarks for user', async () => {
      const userId = 1;
      const mockBookmarks = [
        { id: 1, title: 'First bookmark', userId },
        { id: 2, title: 'Second bookmark', userId },
      ] as Bookmark[];

      jest.spyOn(prisma.bookmark, 'findMany').mockResolvedValue(mockBookmarks);

      const result = await service.getBookmarks(userId);
      expect(result).toEqual(mockBookmarks);
      expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('getBookmarkById', () => {
    it('should return a bookmark for user', async () => {
      const userId = 1;
      const bookmarkId = 1;
      const mockBookmark = {
        id: bookmarkId,
        userId,
        title: 'Test Bookmark',
      } as Bookmark;

      jest.spyOn(prisma.bookmark, 'findFirst').mockResolvedValue(mockBookmark);
    });
  });

  describe('createBookmark', () => {
    it('should create and return a new bookmark', async () => {
      const userId = 1;
      const dto: CreateBookmarkDto = {
        title: 'Test Bookmark',
        link: 'https://test.com',
        description: 'Test Description',
      };
      const mockBookmark = { id: 1, ...dto, userId } as Bookmark;

      jest.spyOn(prisma.bookmark, 'create').mockResolvedValue(mockBookmark);

      const result = await service.createBookmark(userId, dto);
      expect(result).toEqual(mockBookmark);
      expect(prisma.bookmark.create).toHaveBeenCalledWith({
        data: {
          userId,
          ...dto,
        },
      });
    });
  });

  describe('editBookmarkById', () => {
    it('should update and return the bookmark if user owns it', async () => {
      const userId = 1;
      const bookmarkId = 1;
      const dto: EditBookmarkDto = { title: 'Updated Title' };
      const mockBookmark = {
        id: bookmarkId,
        userId,
        title: 'Old Title',
      } as Bookmark;
      const updatedBookmark = { ...mockBookmark, ...dto } as Bookmark;

      jest.spyOn(prisma.bookmark, 'findUnique').mockResolvedValue(mockBookmark);
      jest.spyOn(prisma.bookmark, 'update').mockResolvedValue(updatedBookmark);

      const result = await service.editBookmarkById(userId, bookmarkId, dto);
      expect(result).toEqual(updatedBookmark);
    });

    it('should throw ForbiddenException if user does not own the bookmark', async () => {
      const userId = 1;
      const bookmarkId = 1;
      const dto: EditBookmarkDto = { title: 'Updated Title' };
      const mockBookmark = {
        id: bookmarkId,
        userId: 2,
        title: 'Old Title',
      } as Bookmark;

      jest.spyOn(prisma.bookmark, 'findUnique').mockResolvedValue(mockBookmark);

      await expect(
        service.editBookmarkById(userId, bookmarkId, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteBookmarkById', () => {
    it('should delete bookmark if user owns it', async () => {
      const userId = 1;
      const bookmarkId = 1;
      const mockBookmark = {
        id: bookmarkId,
        userId,
        title: 'To Delete',
      } as Bookmark;

      jest.spyOn(prisma.bookmark, 'findUnique').mockResolvedValue(mockBookmark);
      jest.spyOn(prisma.bookmark, 'delete').mockResolvedValue(mockBookmark);

      await service.deleteBookmarkById(userId, bookmarkId);
      expect(prisma.bookmark.delete).toHaveBeenCalledWith({
        where: { id: bookmarkId },
      });
    });

    it('should throw ForbiddenException if user does not own the bookmark', async () => {
      const userId = 1;
      const bookmarkId = 1;
      const mockBookmark = {
        id: bookmarkId,
        userId: 2,
        title: 'To Delete',
      } as Bookmark;

      jest.spyOn(prisma.bookmark, 'findUnique').mockResolvedValue(mockBookmark);

      await expect(
        service.deleteBookmarkById(userId, bookmarkId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
