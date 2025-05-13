import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { AppController } from "./constructor";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        serviceList: [
          { name: 'auth', url: process.env.AUTH_SERVICE_URL },
          { name: 'user', url: process.env.USER_SERVICE_URL },
          { name: 'board', url: process.env.BOARD_SERVICE_URL },
          { name: 'task', url: process.env.TASK_SERVICE_URL },
        ],
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
