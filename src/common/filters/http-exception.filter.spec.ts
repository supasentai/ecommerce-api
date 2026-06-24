import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let response: {
    status: jest.Mock;
    json: jest.Mock;
  };

  const createHost = (url = '/test') =>
    ({
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ url }),
      }),
    }) as unknown as ArgumentsHost;

  const createPrismaError = (
    code: string,
    meta?: Record<string, unknown>,
  ) =>
    new Prisma.PrismaClientKnownRequestError('Prisma error', {
      code,
      clientVersion: 'test',
      meta,
    });

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should preserve existing HttpException response format', () => {
    filter.catch(new BadRequestException('Invalid input'), createHost('/bad'));

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        path: '/bad',
        message: 'Invalid input',
      }),
    );
  });

  it('should map P2002 email unique constraint to 409 Conflict', () => {
    filter.catch(createPrismaError('P2002', { target: ['email'] }), createHost());

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        path: '/test',
        message: 'Email already exists',
      }),
    );
  });

  it('should map P2002 slug unique constraint to 409 Conflict', () => {
    filter.catch(createPrismaError('P2002', { target: ['slug'] }), createHost());

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        path: '/test',
        message: 'Slug already exists',
      }),
    );
  });

  it('should map P2003 foreign key constraint to 400 Bad Request', () => {
    filter.catch(createPrismaError('P2003'), createHost());

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Cannot delete or update because related records exist',
      }),
    );
  });

  it('should map P2025 record not found to 404 Not Found', () => {
    filter.catch(createPrismaError('P2025'), createHost());

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Resource not found',
      }),
    );
  });
});
