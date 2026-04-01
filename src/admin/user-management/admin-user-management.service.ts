import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { EmailService } from "../../common/email/email.service";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { UserStatus } from '@prisma/client';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
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

    // 📧 Send email after status change
    await this.sendStatusEmail(updatedUser.email, dto);

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

    await this.emailService.sendMail(email, subject, html);
  }
}
