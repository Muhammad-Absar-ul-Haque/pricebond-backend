import { Module } from '@nestjs/common';
import { AdminUserManagementModule } from './user-management/admin-user-management.module';
import { AdminDrawManagementModule } from './draw-management/admin-draw-management.module';

@Module({
  imports: [AdminUserManagementModule, AdminDrawManagementModule],
})
export class AdminModule {}