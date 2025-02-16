import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

type EmailOptions = {
  to: string;
  subject: string;
  template: string;
  variables: object;
};
@Injectable()
export class EmailService {
  constructor(private emailService: MailerService) {}

  async sendEmail({ subject, template, to, variables }: EmailOptions) {
    await this.emailService.sendMail({
      to,
      subject,
      template,
      context: { ...variables },
    });
  }
}
