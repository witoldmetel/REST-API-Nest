import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

describe('BookmarkController', () => {
  let controller: BookmarkController;
  let bookmarkService: BookmarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarkController],
      providers: [
        {
          provide: BookmarkService,
          useValue: {
            getBookmarks: jest.fn(),
            getBookmarkById: jest.fn(),
            createBookmark: jest.fn(),
            editBookmarkById: jest.fn(),
            deleteBookmarkById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BookmarkController>(BookmarkController);
    bookmarkService = module.get<BookmarkService>(BookmarkService);
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('bookmarkService should be defined', () => {
    expect(bookmarkService).toBeDefined();
  });

  describe('getBookmarks', () => {
    it('should call bookmarkService.getBookmarks with userId', () => {
      const userId = 1;

      controller.getBookmarks(userId);

      expect(bookmarkService.getBookmarks).toHaveBeenCalledWith(userId);
    });
  });

  describe('getBookmarkById', () => {
    it('should call bookmarkService.getBookmarkById with correct parameters', () => {
      const userId = 1;
      const bookmarkId = 2;

      controller.getBookmarkById(userId, bookmarkId);

      expect(bookmarkService.getBookmarkById).toHaveBeenCalledWith(
        userId,
        bookmarkId,
      );
    });
  });

  describe('createBookmark', () => {
    it('should call bookmarkService.createBookmark with correct parameters', () => {
      const userId = 1;
      const dto: CreateBookmarkDto = {
        title: 'Test Bookmark',
        link: 'https://test.com',
        description: 'Test Description',
      };

      controller.createBookmark(userId, dto);

      expect(bookmarkService.createBookmark).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('editBookmarkById', () => {
    it('should call bookmarkService.editBookmarkById with correct parameters', () => {
      const userId = 1;
      const bookmarkId = 2;
      const dto: EditBookmarkDto = {
        title: 'Updated Title',
      };

      controller.editBookmarkById(userId, bookmarkId, dto);

      expect(bookmarkService.editBookmarkById).toHaveBeenCalledWith(
        userId,
        bookmarkId,
        dto,
      );
    });
  });

  describe('deleteBookmarkById', () => {
    it('should call bookmarkService.deleteBookmarkById with correct parameters', () => {
      const userId = 1;
      const bookmarkId = 2;

      controller.deleteBookmarkById(userId, bookmarkId);

      expect(bookmarkService.deleteBookmarkById).toHaveBeenCalledWith(
        userId,
        bookmarkId,
      );
    });
  });
});
