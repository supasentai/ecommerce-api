import { Injectable } from '@nestjs/common';

@Injectable()
export class OrdersService {
  checkout(userId: string) {
    return {
      message: 'Checkout endpoint',
      userId,
    };
  }

  findMyOrders(userId: string) {
    return {
      message: 'Find my orders endpoint',
      userId,
    };
  }

  findMyOrder(userId: string, orderId: string) {
    return {
      message: 'Find my order endpoint',
      userId,
      orderId,
    };
  }
}
