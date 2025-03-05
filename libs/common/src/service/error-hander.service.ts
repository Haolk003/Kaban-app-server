import {
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DomainException,
  PrismaException,
  ServiceException,
} from '../exceptions/custom.exception';

@Injectable()
export class ErrorHandlerService {
  private readonly logger = new Logger(ErrorHandlerService.name);

  handleError(error: Error, context: string, requestId?: string): never {
    const errorId = requestId || `ERR-${Date.now()}`; // Tạo ID lỗi nếu không có requestId

    // 📌 Log chi tiết lỗi
    this.logger.error(
      `[${context}] [ErrorID: ${errorId}] ${error.message}`,
      error.stack,
    );

    // ✅ Trả về lỗi có ID để dễ debug
    if (error instanceof DomainException) throw error;
    if (error instanceof HttpException) throw error;

    // ✅ Xử lý lỗi Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.warn(`[Prisma] ${error.code} - ${error.message}`, error.meta);
      throw this.handlePrismaError(error);
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new ServiceException(context, {
        code: 'DATABASE_INIT_ERROR',
        message: 'Failed to connect to the database',
      });
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new ServiceException(context, {
        code: 'VALIDATION_ERROR',
        message: 'Invalid database query',
      });
    }

    // ✅ Xử lý lỗi từ Microservices (nếu có)
    if ('code' in error && typeof error['code'] === 'string') {
      this.logger.warn(`[Microservice] ${error['code']} - ${error.message}`);
      throw new ServiceException(context, {
        code: 'MICROSERVICE_ERROR',
        message: error.message,
      });
    }

    // ❌ Xử lý lỗi không xác định
    throw new InternalServerErrorException({
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      errorId,
    });
  }

  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): PrismaException {
    const errorMapping: Record<string, { code: string; message: string }> = {
      P2002: { code: 'CONFLICT', message: 'Unique constraint violation' },
      P2025: { code: 'NOT_FOUND', message: 'Record not found' },
      P2014: { code: 'INVALID_RELATION', message: 'Invalid relation field' },
      P2003: {
        code: 'FOREIGN_KEY_CONSTRAINT',
        message: 'Foreign key constraint failed',
      },
      P2000: { code: 'DATA_TOO_LONG', message: 'Provided value is too long' },
    };

    const mappedError = errorMapping[error.code] || {
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
    };

    return new PrismaException({
      ...mappedError,
    });
  }
}
