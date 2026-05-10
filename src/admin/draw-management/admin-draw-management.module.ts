import { Module } from '@nestjs/common';
import { AdminDrawManagementController } from './admin-draw-management.controller';
import { AdminDrawManagementService } from './admin-draw-management.service';
import { PdfParserModule } from '../../common/pdf-parser/pdf-parser.module';
import { ScrutinyModule } from '../../common/scrutiny/scrutiny.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [PdfParserModule, ScrutinyModule, CloudinaryModule, NotificationsModule],
  controllers: [AdminDrawManagementController],
  providers: [AdminDrawManagementService],
})
export class AdminDrawManagementModule {}
