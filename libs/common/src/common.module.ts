import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'y/prisma';
import { ErrorHandlerService } from './service/error-hander.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRECT'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [CommonService, PrismaService, JwtService, ErrorHandlerService],
  exports: [CommonService, ErrorHandlerService],
})
export class CommonModule {}
