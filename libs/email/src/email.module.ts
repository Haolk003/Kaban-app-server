import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService): MailerOptions => ({
        transport: {
          host: config.get('SMTP_HOST') as string,
          secure: false,
          auth: {
            user: config.get('SMTP_MAIL') as string,
            pass: config.get('SMTP_PASSWORD') as string,
          },
        },
        defaults: {
          from: '"No Reply" <noreply@example.com>',
        },
        template: {
          dir: join(
            __dirname,
            '../../../../kanban-server/libs/email/src/templates',
          ),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),

      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
