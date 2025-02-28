import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ApolloGateway } from '@apollo/gateway';
async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  await app.listen(process.env.port ?? 4005);
}
bootstrap();
