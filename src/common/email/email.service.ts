import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly isEmailEnabled: boolean;

  constructor() {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      ENABLE_EMAIL,
    } = process.env;

    const hasSmtpConfig =
      !!SMTP_HOST && !!SMTP_PORT && !!SMTP_USER && !!SMTP_PASS;

    // Email is enabled ONLY if env says true AND we have config
    this.isEmailEnabled = ENABLE_EMAIL === 'true' && hasSmtpConfig;

    if (this.isEmailEnabled) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      this.logger.log('✅ Email service ENABLED (SMTP configured)');
    } else {
      const reason = ENABLE_EMAIL !== 'true' 
        ? 'ENABLE_EMAIL is not "true"' 
        : 'SMTP credentials missing';
      this.logger.warn(`📨 Email service in MOCK MODE (${reason})`);
    }
  }

  async sendMail(to: string, subject: string, html: string) {
    const from =
      process.env.EMAIL_FROM ||
      `"PrizeBond App" <no-reply@localhost>`;

    // 🚫 NO SMTP → LOG EMAIL
    if (!this.isEmailEnabled || !this.transporter) {
      this.logger.warn('📨 Email NOT sent (development mode)');
      this.logger.log('----------------------------------------');
      this.logger.log(`FROM: ${from}`);
      this.logger.log(`TO: ${to}`);
      this.logger.log(`SUBJECT: ${subject}`);
      this.logger.log('BODY (HTML):');
      console.log(html);
      this.logger.log('----------------------------------------');
      return;
    }

    // ✅ REAL EMAIL SEND
    await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    this.logger.log(`📧 Email sent to ${to}`);
  }
}