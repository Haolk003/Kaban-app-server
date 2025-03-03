import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
// import { RabbitmqModule } from 'y/rabbitmq';
// import { EmailModule } from 'y/email';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';

import { ApiResolver } from './api.resolver';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: 'auth', url: 'http://localhost:4001/graphql' },
            { name: 'board', url: 'http://localhost:4003/graphql' },
          ],
        }),
        buildService: ({ url }) => {
          return new RemoteGraphQLDataSource({
            url,
            willSendRequest({ request, context }) {
              // Chuyển tiếp headers từ client đến subgraph
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              if (context.req?.headers) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                Object.entries(context.req.headers).forEach(([key, value]) => {
                  request.http?.headers.set(key, value as string);
                });
              }
            },
            didReceiveResponse({ response, context }) {
              // Chuyển tiếp Set-Cookie từ subgraph đến client
              const cookie = response.http?.headers?.get('set-cookie');
              if (cookie && context.res) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                context.res.setHeader('Set-Cookie', cookie);
              }
              return response;
            },
          });
        },
      },
    }),
  ],
  controllers: [ApiController],
  providers: [ApiService, ApiResolver],
})
export class ApiModule {}
