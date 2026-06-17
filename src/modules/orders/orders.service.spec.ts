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
    },
    orderItem: {
      createMany: jest.fn(),
    },
    product: {
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
    mockPrismaService.$transaction.mockImplementation((callback) =>
      callback(mockPrismaService),
    );
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

    expect(mockPrismaService.order.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when stock is insufficient', async () => {
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

    expect(mockPrismaService.order.create).not.toHaveBeenCalled();
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
    mockPrismaService.order.create.mockResolvedValue(createdOrder);
    mockPrismaService.orderItem.createMany.mockResolvedValue({ count: 2 });
    mockPrismaService.product.update.mockResolvedValue({});
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
    expect(mockPrismaService.product.update).toHaveBeenCalledWith({
      where: { id: 'product-id' },
      data: {
        stock: {
          decrement: 2,
        },
      },
    });
    expect(mockPrismaService.product.update).toHaveBeenCalledWith({
      where: { id: 'product-id-2' },
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

  it('should return find my orders skeleton response', () => {
    expect(service.findMyOrders('user-id')).toEqual({
      message: 'Find my orders endpoint',
      userId: 'user-id',
    });
  });

  it('should return find my order skeleton response', () => {
    expect(service.findMyOrder('user-id', 'order-id')).toEqual({
      message: 'Find my order endpoint',
      userId: 'user-id',
      orderId: 'order-id',
    });
  });
});
