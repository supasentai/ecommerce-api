import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ServiceUnavailableException } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let prismaService: {
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
      $queryRaw: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return ok when database is connected', async () => {
      prismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      await expect(appController.health()).resolves.toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        database: 'connected',
      });

      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should throw ServiceUnavailableException when database is disconnected', async () => {
      prismaService.$queryRaw.mockRejectedValue(new Error('DB unavailable'));

      await expect(appController.health()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
