import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return checkout skeleton response', () => {
    expect(service.checkout('user-id')).toEqual({
      message: 'Checkout endpoint',
      userId: 'user-id',
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
