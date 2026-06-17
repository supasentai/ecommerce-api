import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      for (const item of cartItems) {
        if (!item.product) {
          throw new BadRequestException('Product no longer exists');
        }

        if (!item.product.isActive) {
          throw new BadRequestException('Product is not active');
        }

        if (item.product.stock < item.quantity) {
          throw new BadRequestException('Not enough stock');
        }
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      );

      const order = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalAmount,
        },
      });

      await tx.orderItem.createMany({
        data: cartItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });

      await Promise.all(
        cartItems.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      );

      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
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
