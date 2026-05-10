import { Module } from '@nestjs/common';
import { AdminUserManagementModule } from './user-management/admin-user-management.module';
import { AdminDrawManagementModule } from './draw-management/admin-draw-management.module';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';
import { AdminMarketplaceManagementModule } from './marketplace-management/admin-marketplace-management.module';

@Module({
  imports: [
    AdminUserManagementModule,
    AdminDrawManagementModule,
    AdminDashboardModule,
    AdminMarketplaceManagementModule,
  ],
})
export class AdminModule {}