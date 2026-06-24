import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const prismaError = this.mapPrismaError(exception);

    const isHttpException = exception instanceof HttpException;

    const statusCode = prismaError
      ? prismaError.statusCode
      : isHttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = prismaError
      ? prismaError.message
      : isHttpException
        ? exception.getResponse()
        : 'Internal server error';

    let message: string | string[];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const responseBody = exceptionResponse as { message: string | string[] };
      message = responseBody.message;
    } else {
      message = 'Unexpected error';
    }

    response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private mapPrismaError(exception: unknown) {
    if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) {
      return null;
    }

    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: this.getUniqueConstraintMessage(exception.meta),
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cannot delete or update because related records exist',
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
        };
      default:
        return null;
    }
  }

  private getUniqueConstraintMessage(meta?: Record<string, unknown>) {
    const target = meta?.target;
    const fields = Array.isArray(target) ? target.map(String) : [];

    if (fields.includes('email')) {
      return 'Email already exists';
    }

    if (fields.includes('slug')) {
      return 'Slug already exists';
    }

    return 'Resource already exists';
  }
}
