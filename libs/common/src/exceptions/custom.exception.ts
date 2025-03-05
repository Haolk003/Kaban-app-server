// src/common/exceptions/custom.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(
    public code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}

export class PrismaException extends DomainException {
  constructor(error: { code: string; message: string }) {
    super(`PRISMA_${error.code}`, error.message);
  }
}

export class ServiceException extends DomainException {
  constructor(serviceName: string, error: { code: string; message: string }) {
    super(
      `${serviceName.toUpperCase()}_${error.code}`,
      error.message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
