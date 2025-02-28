import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
// import { Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

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
