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
        subject = "Your account has been approved";
        html = `<p>Your account is now active. You can log in and start using the app.</p>`;
        break;

      case UserStatus.REJECTED:
        subject = "Your account has been rejected";
        html = `<p>Your account was rejected by the admin.</p>`;
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
