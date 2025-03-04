// src/common/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/custom.exception';
import { GraphQLError } from 'graphql';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const contextType = host.getType();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };

    if (exception instanceof DomainException) {
      status = exception.getStatus();
      errorResponse = {
        code: exception.code,
        message: exception.message,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorResponse = exception.getResponse();
    }

    if (contextType === 'http') {
      response.status(status).json({
        ...errorResponse,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    return new GraphQLError(exception.message, {
      extensions: { status: status },
    });
  }

  private handleHttpException(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };

    if (exception instanceof DomainException) {
      status = exception.getStatus();
      errorResponse = {
        code: exception.code,
        message: exception.message,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      errorResponse = exception.getResponse();
    }

    response.status(status).json({
      ...errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
