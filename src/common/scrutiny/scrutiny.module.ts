import { Module } from '@nestjs/common';
import { ScrutinyService } from './scrutiny.service';

@Module({
  providers: [ScrutinyService],
  exports: [ScrutinyService],
})
export class ScrutinyModule {}
