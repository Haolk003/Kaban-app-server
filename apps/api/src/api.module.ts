import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
// import { RabbitmqModule } from 'y/rabbitmq';
// import { EmailModule } from 'y/email';
import { GraphQLModule } from '@nestjs/graphql';
import { HttpModule } from '@nestjs/axios';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { ApiResolver } from './api.resolver';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import * as process from 'node:process';

import {ClientsModule,Transport} from '@nestjs/microservices';

@Module({
  imports: [

    HttpModule.register({ baseURL: 'http://localhost:4001/api' }),
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      server: {
        path: '/graphql',
        context: ({ req, res }: { req: Request; res: Response }) => ({
          req,
          res,
        }),
      },
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            {
              name: 'auth',
              url:
                process.env.AUTH_SERVICE_URL || 'http://localhost:4001/graphql',
            },
            {
              name: 'board',
              url:
                process.env.BOARD_SERVICE_URL ||
                'http://localhost:4003/graphql',
            },
            {
              name: 'task',
              url:
                process.env.TASK_SERVICE_URL || 'http://localhost:4004/graphql',
            },
          ],
        }),
        buildService: ({ url }) => {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {

              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              if (context.req?.headers) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                Object.entries(context.req.headers).forEach(([key, value]) => {
                  request.http?.headers.set(key, value as string);
                });
              }
            },
            didReceiveResponse({ response, context }) {
              const cookies = response.http?.headers?.get('set-cookie');

              if (cookies && context.res) {
                // Debug để xem dạng dữ liệu của cookies
                console.log('Cookies from service:', cookies);
                console.log('Type of cookies:', typeof cookies);

                if (Array.isArray(cookies)) {
                  // Nếu cookies đã là array, giữ nguyên
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                  context.res.setHeader('Set-Cookie', cookies);
                } else if (typeof cookies === 'string') {
                  const cookieArray = cookies.split(/,(?=[^,]*=)/);
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
                  context.res.setHeader('Set-Cookie', cookieArray);
                }
              }

              if (response.errors) {
                response.data = { ...response.data, errors: response.errors };
              }
              return response;
            }
          });
        },
      },
    }),
  ],
  controllers: [ApiController],
  providers: [ApiService, ApiResolver],
})
export class ApiModule {}
