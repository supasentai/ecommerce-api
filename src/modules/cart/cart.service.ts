import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    return {
      items,
      summary: {
        totalItems,
        totalAmount,
      },
    };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not active');
    }

    if (product.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: dto.productId,
        },
      },
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + dto.quantity;

      if (product.stock < newQuantity) {
        throw new BadRequestException('Not enough stock');
      }

      return this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async updateItem(userId: string, cartItemId: string, dto: UpdateCartItemDto) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.product.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    return this.prisma.cartItem.update({
      where: {
        id: cartItemId,
      },
      data: {
        quantity: dto.quantity,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async removeItem(userId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: {
        id: cartItemId,
      },
    });

    return {
      message: 'Cart item removed successfully',
    };
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({
      where: {
        userId,
      },
    });

    return {
      message: 'Cart cleared successfully',
    };
  }
}
