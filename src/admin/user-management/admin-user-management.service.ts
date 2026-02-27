import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminUserManagementService {
  constructor(private readonly prisma: PrismaService) {}

  // List all users with PENDING status
 async listUsers(status?: UserStatus) {
    const whereClause = status ? { status } : {};
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
        createdAt: 'desc',
      },
    });
  }

  // Approve or reject a user
  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status: dto.status,
        ...(dto.status === 'REJECTED' && { rejectionReason: dto.reason }),
      },
    });
  }
}