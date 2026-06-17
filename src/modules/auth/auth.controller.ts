import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  profile(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(request.user.id, dto);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(request.user.id, dto);
  }
}
