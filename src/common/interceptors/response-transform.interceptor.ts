import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface StandardResponse<T> {
  success: boolean;
  timestamp: string;
  path: string;
  data: T;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        timestamp: new Date().toISOString(),
        path: request.url,
        data,
      })),
    );
  }
}
