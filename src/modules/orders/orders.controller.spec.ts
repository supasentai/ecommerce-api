import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  const mockOrdersService = {
    checkout: jest.fn(),
    findMyOrders: jest.fn(),
    findMyOrder: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-id',
      email: 'user@test.com',
      role: 'USER',
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call ordersService.checkout', () => {
    const result = {
      message: 'Checkout endpoint',
      userId: 'user-id',
    };

    mockOrdersService.checkout.mockReturnValue(result);

    expect(controller.checkout(mockRequest)).toEqual(result);
    expect(mockOrdersService.checkout).toHaveBeenCalledWith('user-id');
  });

  it('should call ordersService.findMyOrders', () => {
    const result = {
      message: 'Find my orders endpoint',
      userId: 'user-id',
    };

    mockOrdersService.findMyOrders.mockReturnValue(result);

    expect(controller.findMyOrders(mockRequest)).toEqual(result);
    expect(mockOrdersService.findMyOrders).toHaveBeenCalledWith('user-id');
  });

  it('should call ordersService.findMyOrder', () => {
    const result = {
      message: 'Find my order endpoint',
      userId: 'user-id',
      orderId: 'order-id',
    };

    mockOrdersService.findMyOrder.mockReturnValue(result);

    expect(controller.findMyOrder(mockRequest, 'order-id')).toEqual(result);
    expect(mockOrdersService.findMyOrder).toHaveBeenCalledWith(
      'user-id',
      'order-id',
    );
  });
});
