import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@Req() request: AuthenticatedRequest) {
    return this.ordersService.checkout(request.user.id);
  }

  @Get()
  findMyOrders(@Req() request: AuthenticatedRequest) {
    return this.ordersService.findMyOrders(request.user.id);
  }

  @Get(':id')
  findMyOrder(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.ordersService.findMyOrder(request.user.id, id);
  }
}
