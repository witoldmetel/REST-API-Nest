import { Test, TestingModule } from '@nestjs/testing';
import { BookmarkModule } from './bookmark.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

describe('BookmarkModule', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        BookmarkModule,
        PrismaModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ DATABASE_URL: 'test_database_url' })],
        }),
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('prismaService should be defined', () => {
    expect(prismaService).toBeDefined();
  });
});
