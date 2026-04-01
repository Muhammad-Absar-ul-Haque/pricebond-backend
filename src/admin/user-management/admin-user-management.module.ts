import { Module } from '@nestjs/common';
import { AdminUserManagementController } from './admin-user-management.controller';
import { UserManagementService } from './admin-user-management.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailModule } from '../../common/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [AdminUserManagementController],
  providers: [UserManagementService, PrismaService],
  exports: [UserManagementService],
})
export class AdminUserManagementModule {}