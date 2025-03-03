import { NestFactory } from '@nestjs/core';
import { BoardModule } from './board.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(BoardModule);
  app.use(cookieParser());
  await app.listen(process.env.port ?? 4003);
}
bootstrap();
