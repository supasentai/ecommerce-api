import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    cartItem: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    orderItem: {
      createMany: jest.fn(),
    },
    product: {
      updateMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockProduct = {
    id: 'product-id',
    name: 'Test Product',
    price: 100,
    stock: 10,
    isActive: true,
  };

  const mockCartItem = {
    id: 'cart-item-id',
    userId: 'user-id',
    productId: 'product-id',
    quantity: 2,
    product: mockProduct,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    mockPrismaService.$transaction.mockImplementation((arg) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }

      return arg(mockPrismaService);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw BadRequestException when cart is empty', async () => {
    mockPrismaService.cartItem.findMany.mockResolvedValue([]);

    await expect(service.checkout('user-id')).rejects.toThrow(
      BadRequestException,
    );

    expect(mockPrismaService.cartItem.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
      include: { product: true },
    });
    expect(mockPrismaService.order.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when product is inactive', async () => {
    mockPrismaService.product.updateMany.mockResolvedValue({ count: 0 });
    mockPrismaService.cartItem.findMany.mockResolvedValue([
      {
        ...mockCartItem,
        product: {
          ...mockProduct,
          isActive: false,
        },
      },
    ]);

    await expect(service.checkout('user-id')).rejects.toThrow(
      BadRequestException,
    );

    expect(mockPrismaService.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'product-id',
        isActive: true,
        stock: {
          gte: 2,
        },
      },
      data: {
        stock: {
          decrement: 2,
        },
      },
    });
    expect(mockPrismaService.order.create).not.toHaveBeenCalled();
    expect(mockPrismaService.cartItem.deleteMany).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when stock is insufficient', async () => {
    mockPrismaService.product.updateMany.mockResolvedValue({ count: 0 });
    mockPrismaService.cartItem.findMany.mockResolvedValue([
      {
        ...mockCartItem,
        quantity: 3,
        product: {
          ...mockProduct,
          stock: 2,
        },
      },
    ]);

    await expect(service.checkout('user-id')).rejects.toThrow(
      BadRequestException,
    );

    expect(mockPrismaService.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'product-id',
        isActive: true,
        stock: {
          gte: 3,
        },
      },
      data: {
        stock: {
          decrement: 3,
        },
      },
    });
    expect(mockPrismaService.order.create).not.toHaveBeenCalled();
    expect(mockPrismaService.orderItem.createMany).not.toHaveBeenCalled();
    expect(mockPrismaService.cartItem.deleteMany).not.toHaveBeenCalled();
  });

  it('should create order, order items, update stock, and clear cart', async () => {
    const secondCartItem = {
      id: 'cart-item-id-2',
      userId: 'user-id',
      productId: 'product-id-2',
      quantity: 1,
      product: {
        ...mockProduct,
        id: 'product-id-2',
        price: '50.5',
        stock: 5,
      },
    };

    const createdOrder = {
      id: 'order-id',
      userId: 'user-id',
      status: OrderStatus.PENDING,
      totalAmount: 250.5,
    };

    const returnedOrder = {
      ...createdOrder,
      items: [
        {
          id: 'order-item-id',
          orderId: 'order-id',
          productId: 'product-id',
          quantity: 2,
          price: 100,
          product: mockProduct,
        },
      ],
    };

    mockPrismaService.cartItem.findMany.mockResolvedValue([
      mockCartItem,
      secondCartItem,
    ]);
    mockPrismaService.product.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaService.order.create.mockResolvedValue(createdOrder);
    mockPrismaService.orderItem.createMany.mockResolvedValue({ count: 2 });
    mockPrismaService.cartItem.deleteMany.mockResolvedValue({ count: 2 });
    mockPrismaService.order.findUnique.mockResolvedValue(returnedOrder);

    await expect(service.checkout('user-id')).resolves.toEqual(returnedOrder);

    expect(mockPrismaService.$transaction).toHaveBeenCalled();
    expect(mockPrismaService.order.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-id',
        status: OrderStatus.PENDING,
        totalAmount: 250.5,
      },
    });
    expect(mockPrismaService.orderItem.createMany).toHaveBeenCalledWith({
      data: [
        {
          orderId: 'order-id',
          productId: 'product-id',
          quantity: 2,
          price: 100,
        },
        {
          orderId: 'order-id',
          productId: 'product-id-2',
          quantity: 1,
          price: '50.5',
        },
      ],
    });
    expect(mockPrismaService.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'product-id',
        isActive: true,
        stock: {
          gte: 2,
        },
      },
      data: {
        stock: {
          decrement: 2,
        },
      },
    });
    expect(mockPrismaService.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'product-id-2',
        isActive: true,
        stock: {
          gte: 1,
        },
      },
      data: {
        stock: {
          decrement: 1,
        },
      },
    });
    expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
    });
    expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
      where: { id: 'order-id' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });

  it('should prevent overselling when concurrent checkout attempts compete for the same stock', async () => {
    let remainingStock = 2;

    mockPrismaService.cartItem.findMany.mockImplementation(async ({ where }) => [
      {
        ...mockCartItem,
        userId: where.userId,
        quantity: 2,
        product: {
          ...mockProduct,
          stock: remainingStock,
        },
      },
    ]);
    mockPrismaService.product.updateMany.mockImplementation(
      async ({ where, data }) => {
        if (
          where.id === 'product-id' &&
          where.isActive === true &&
          remainingStock >= where.stock.gte
        ) {
          remainingStock -= data.stock.decrement;
          return { count: 1 };
        }

        return { count: 0 };
      },
    );
    mockPrismaService.order.create.mockImplementation(async ({ data }) => ({
      id: `order-${data.userId}`,
      ...data,
    }));
    mockPrismaService.orderItem.createMany.mockResolvedValue({ count: 1 });
    mockPrismaService.cartItem.deleteMany.mockResolvedValue({ count: 1 });
    mockPrismaService.order.findUnique.mockImplementation(async ({ where }) => ({
      id: where.id,
      status: OrderStatus.PENDING,
      items: [],
    }));

    const results = await Promise.allSettled([
      service.checkout('user-id-1'),
      service.checkout('user-id-2'),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(
      1,
    );
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(
      1,
    );
    expect(remainingStock).toBe(0);
    expect(mockPrismaService.order.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.cartItem.deleteMany).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending order and restore stock', async () => {
    const order = {
      id: 'order-id',
      userId: 'user-id',
      status: OrderStatus.PENDING,
      items: [
        {
          id: 'order-item-id',
          orderId: 'order-id',
          productId: 'product-id',
          quantity: 2,
          price: 100,
        },
      ],
    };

    const cancelledOrder = {
      ...order,
      status: OrderStatus.CANCELLED,
      items: [
        {
          ...order.items[0],
          product: mockProduct,
        },
      ],
    };

    mockPrismaService.order.findFirst.mockResolvedValue(order);
    mockPrismaService.order.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaService.product.update.mockResolvedValue(mockProduct);
    mockPrismaService.order.findUnique.mockResolvedValue(cancelledOrder);

    await expect(
      service.cancelMyOrder('user-id', 'order-id'),
    ).resolves.toEqual(cancelledOrder);

    expect(mockPrismaService.order.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'order-id',
        userId: 'user-id',
      },
      include: {
        items: true,
      },
    });
    expect(mockPrismaService.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'order-id',
        userId: 'user-id',
        status: OrderStatus.PENDING,
      },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
    expect(mockPrismaService.product.update).toHaveBeenCalledWith({
      where: {
        id: 'product-id',
      },
      data: {
        stock: {
          increment: 2,
        },
      },
    });
    expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'order-id',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });

  it('should throw BadRequestException when cancelling non-pending order', async () => {
    mockPrismaService.order.findFirst.mockResolvedValue({
      id: 'order-id',
      userId: 'user-id',
      status: OrderStatus.PAID,
      items: [
        {
          id: 'order-item-id',
          orderId: 'order-id',
          productId: 'product-id',
          quantity: 2,
          price: 100,
        },
      ],
    });

    await expect(service.cancelMyOrder('user-id', 'order-id')).rejects.toThrow(
      BadRequestException,
    );

    expect(mockPrismaService.order.updateMany).not.toHaveBeenCalled();
    expect(mockPrismaService.product.update).not.toHaveBeenCalled();
  });

  it('should return paginated user orders', async () => {
    const orders = [
      {
        id: 'order-id',
        userId: 'user-id',
        status: OrderStatus.PENDING,
        items: [],
      },
    ];

    mockPrismaService.order.findMany.mockResolvedValue(orders);
    mockPrismaService.order.count.mockResolvedValue(1);

    await expect(
      service.findMyOrders('user-id', {
        status: OrderStatus.PENDING,
        fromDate: '2026-01-01T00:00:00.000Z',
        toDate: '2026-01-31T23:59:59.999Z',
        sortBy: 'totalAmount',
        sortOrder: 'asc',
      }),
    ).resolves.toEqual({
      data: orders,
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
      userId: 'user-id',
      status: OrderStatus.PENDING,
      createdAt: {
        gte: new Date('2026-01-01T00:00:00.000Z'),
        lte: new Date('2026-01-31T23:59:59.999Z'),
      },
    };

    expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      skip: 0,
      take: 10,
      orderBy: {
        totalAmount: 'asc',
      },
      include: {
        items: true,
      },
    });
    expect(mockPrismaService.order.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
  });

  it('should return filtered admin orders', async () => {
    const orders = [
      {
        id: 'order-id',
        userId: 'user-id',
        status: OrderStatus.PAID,
        items: [],
      },
    ];

    mockPrismaService.order.findMany.mockResolvedValue(orders);
    mockPrismaService.order.count.mockResolvedValue(12);

    await expect(
      service.findAllOrders({
        page: 2,
        limit: 5,
        userId: '11111111-1111-4111-8111-111111111111',
        status: OrderStatus.PAID,
        sortBy: 'status',
        sortOrder: 'asc',
      }),
    ).resolves.toEqual({
      data: orders,
      meta: {
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });

    const expectedWhere = {
      userId: '11111111-1111-4111-8111-111111111111',
      status: OrderStatus.PAID,
    };

    expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      skip: 5,
      take: 5,
      orderBy: {
        status: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        items: true,
      },
    });
    expect(mockPrismaService.order.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
  });

  it('should return user order detail', async () => {
    const order = {
      id: 'order-id',
      userId: 'user-id',
      status: OrderStatus.PENDING,
      items: [],
    };

    mockPrismaService.order.findFirst.mockResolvedValue(order);

    await expect(service.findMyOrder('user-id', 'order-id')).resolves.toEqual(
      order,
    );

    expect(mockPrismaService.order.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'order-id',
        userId: 'user-id',
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });
  });
});
