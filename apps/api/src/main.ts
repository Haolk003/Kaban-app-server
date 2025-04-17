import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import * as cookieParser from 'cookie-parser';
// import { Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  // app.connectMicroservice({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: ['amqp://guest:guest@localhost:5672'],
  //     queue: 'kanban_queue',
  //     queueOptions: { durable: true },
  //   },
  // });
  // await app.startAllMicroservices();
  await app.listen(process.env.port ?? 4000);
}
bootstrap();
