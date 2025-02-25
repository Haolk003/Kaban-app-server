import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { NestExpressApplication } from '@nestjs/platform-express';

import * as cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.set('trust proxy', 1);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'server/email-templates'));
  app.setViewEngine('ejs');
  await app.listen(process.env.port ?? 3001);
}
bootstrap();
