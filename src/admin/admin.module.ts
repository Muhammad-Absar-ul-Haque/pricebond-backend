import { Module } from '@nestjs/common';
import { AdminUserManagementModule} from './user-management/admin-user-management.module';

@Module({
  imports: [AdminUserManagementModule],
})
export class AdminModule {}