import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from './user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

describe('UserModule', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,
        PrismaModule,
        ConfigModule.forRoot({
          isGlobal: true,
          // For testing, you might want to provide mock values
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
