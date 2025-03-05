import { NestFactory } from '@nestjs/core';
import { TaskModule } from './task.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(TaskModule);
  app.use(cookieParser());
  await app.listen(process.env.port ?? 4004);
}
bootstrap();
