import { Module } from '@nestjs/common';
import { AdminDrawManagementController } from './admin-draw-management.controller';
import { AdminDrawManagementService } from './admin-draw-management.service';
import { PdfParserModule } from '../../common/pdf-parser/pdf-parser.module';
import { ScrutinyModule } from '../../common/scrutiny/scrutiny.module';

@Module({
  imports: [PdfParserModule, ScrutinyModule],
  controllers: [AdminDrawManagementController],
  providers: [AdminDrawManagementService],
})
export class AdminDrawManagementModule {}
