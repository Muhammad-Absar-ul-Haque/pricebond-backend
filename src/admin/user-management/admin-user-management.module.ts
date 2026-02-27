import { Module } from '@nestjs/common';
import { AdminUserManagementController } from './admin-user-management.controller';
import { AdminUserManagementService } from './admin-user-management.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AdminUserManagementController],
  providers: [AdminUserManagementService, PrismaService],
  exports: [AdminUserManagementService],
})
export class AdminUserManagementModule {}