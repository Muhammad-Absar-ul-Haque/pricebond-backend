import { Module } from '@nestjs/common';
import { AdminMarketplaceManagementController } from './admin-marketplace-management.controller';
import { AdminMarketplaceManagementService } from './admin-marketplace-management.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminMarketplaceManagementController],
  providers: [AdminMarketplaceManagementService],
})
export class AdminMarketplaceManagementModule {}
