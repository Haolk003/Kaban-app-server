import { NestFactory } from '@nestjs/core';
import { BoardModule } from './board.module';

async function bootstrap() {
  const app = await NestFactory.create(BoardModule);
  await app.listen(process.env.port ?? 4003);
}
bootstrap();
