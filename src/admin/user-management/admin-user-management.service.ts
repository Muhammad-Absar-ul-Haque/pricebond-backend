import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { EmailService } from "../../common/email/email.service";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { UserStatus, NotificationType } from '@prisma/client';
import { NotificationsService } from "../../notifications/notifications.service";

@Injectable()
export class UserManagementService {
  private readonly logger = new Logger(UserManagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listUsers(status?: UserStatus) {
    const whereClause: Prisma.UserWhereInput = status ? { status: status } : {};

    return this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        city: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateUserStatus(userId: number, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: dto.status,
      },
    });

    // 📧 Send email after status change -- Handled inside sendStatusEmail (with logging)
    await this.sendStatusEmail(updatedUser.email, dto);

    // 📱 Send Push Notification
    await this.sendPushNotification(updatedUser.id, dto.status);

    return {
      message: "User status updated successfully",
      userId: updatedUser.id,
      status: updatedUser.status,
    };
  }

  private async sendStatusEmail(email: string, dto: UpdateUserStatusDto) {
    let subject = "";
    let html = "";

    switch (dto.status) {
      case UserStatus.ACTIVE:
        subject = "Welcome to PrizeBond! Your account is approved 🎉";
        html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <h1 style="color: #2E7D32; margin-bottom: 10px;">Account Approved!</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Great news! Your PrizeBond account has been successfully verified and approved by our administration team.
              </p>
              <div style="padding: 20px; background-color: #e8f5e9; border-radius: 8px; margin-bottom: 30px;">
                <p style="color: #1b5e20; margin: 0; font-weight: 500;">
                  You now have full access to check your bonds, view draw schedules, and manage your portfolio.
                </p>
              </div>
              <a href="#" style="display: inline-block; padding: 14px 30px; background-color: #2E7D32; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Login to Your Account</a>
              <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                If you have any questions, feel free to contact our support team.
              </p>
            </div>
          </div>
        `;
        break;

      case UserStatus.REJECTED:
        subject = "Important Update Regarding Your PrizeBond Account";
        html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <h1 style="color: #c62828; margin-bottom: 10px;">Application Status</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                We have reviewed your registration. Unfortunately, your account application has not been approved at this time.
              </p>
              <div style="padding: 20px; background-color: #ffebee; border-radius: 8px; margin-bottom: 30px;">
                <p style="color: #b71c1c; margin: 0; font-weight: 500;">
                  This is usually due to incomplete details or a violation of our security guidelines.
                </p>
              </div>
              <p style="color: #555; font-size: 16px;">
                If you believe this was a mistake, please reach out to our support team to appeal this decision.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
                PrizeBond Security Team
              </p>
            </div>
          </div>
        `;
        break;
    }

    if (subject && html) {
      try {
        await this.emailService.sendMail(email, subject, html);
      } catch (error) {
        this.logger.error(
          `❌ Failed to send status update email to ${email}`,
          error.stack,
        );
        this.logger.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        this.logger.error(`📧 FAILED EMAIL CONTENT:`);
        this.logger.error(`SUBJECT: ${subject}`);
        this.logger.error(`BODY: ${html}`);
        this.logger.error(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      }
    }
  }

  private async sendPushNotification(userId: number, status: UserStatus) {
    let title = "";
    let body = "";

    if (status === UserStatus.ACTIVE) {
      title = "Account Approved! 🎉";
      body = "Your PrizeBond account has been approved. You can now login and manage your bonds.";
    } else if (status === UserStatus.REJECTED) {
      title = "Account Status ⚠️";
      body = "Your account application has been rejected. Please contact support for more information.";
    }

    if (title && body) {
      try {
        await this.notificationsService.sendPushNotification(
          userId,
          title,
          body,
          NotificationType.USER_STATUS,
        );
      } catch (error) {
        this.logger.error(`Failed to send push notification to user ${userId}: ${error.message}`);
      }
    }
  }
}
