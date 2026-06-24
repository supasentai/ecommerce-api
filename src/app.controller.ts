import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiTags('Health')
  @ApiOkResponse({
    description: 'Application and database are healthy.',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-06-24T00:00:00.000Z',
        database: 'connected',
      },
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'Database is unavailable.',
    schema: {
      example: {
        statusCode: 503,
        timestamp: '2026-06-24T00:00:00.000Z',
        path: '/health',
        message: 'Database disconnected',
      },
    },
  })
  health() {
    return this.appService.getHealth();
  }
}
