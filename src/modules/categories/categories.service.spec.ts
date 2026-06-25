import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    mockPrismaService.$transaction.mockImplementation((queries) =>
      Promise.all(queries),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return categories with standardized pagination meta and sorting', async () => {
    const category = {
      id: 'category-id',
      name: 'Electronics',
      slug: 'electronics',
    };

    mockPrismaService.category.findMany.mockResolvedValue([category]);
    mockPrismaService.category.count.mockResolvedValue(1);

    await expect(
      service.findAll({
        page: 1,
        limit: 10,
        search: 'elect',
        sortBy: 'name',
        sortOrder: 'asc',
      }),
    ).resolves.toEqual({
      data: [category],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    const expectedWhere = {
      OR: [
        {
          name: {
            contains: 'elect',
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: 'elect',
            mode: 'insensitive',
          },
        },
      ],
    };

    expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      orderBy: {
        name: 'asc',
      },
      skip: 0,
      take: 10,
    });
    expect(mockPrismaService.category.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
  });
});
