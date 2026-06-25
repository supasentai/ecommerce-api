import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
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

  it('should return products with standardized pagination meta', async () => {
    const product = {
      id: 'product-id',
      name: 'Keyboard',
      price: 100,
      categoryId: 'category-id',
      isActive: true,
    };

    mockPrismaService.product.findMany.mockResolvedValue([product]);
    mockPrismaService.product.count.mockResolvedValue(11);

    await expect(
      service.findAll({
        page: 2,
        limit: 10,
      }),
    ).resolves.toEqual({
      data: [product],
      meta: {
        page: 2,
        limit: 10,
        total: 11,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
  });

  it('should apply product filters and sorting', async () => {
    mockPrismaService.product.findMany.mockResolvedValue([]);
    mockPrismaService.product.count.mockResolvedValue(0);

    await service.findAll({
      page: 1,
      limit: 20,
      search: 'keyboard',
      categoryId: '11111111-1111-4111-8111-111111111111',
      isActive: true,
      minPrice: 50,
      maxPrice: 250,
      sortBy: 'price',
      sortOrder: 'asc',
    });

    const expectedWhere = {
      OR: [
        {
          name: {
            contains: 'keyboard',
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: 'keyboard',
            mode: 'insensitive',
          },
        },
      ],
      categoryId: '11111111-1111-4111-8111-111111111111',
      isActive: true,
      price: {
        gte: 50,
        lte: 250,
      },
    };

    expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      include: {
        category: true,
      },
      orderBy: {
        price: 'asc',
      },
      skip: 0,
      take: 20,
    });
    expect(mockPrismaService.product.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
  });
});
