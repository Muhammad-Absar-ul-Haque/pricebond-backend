import { Module } from '@nestjs/common';
import { UserBondsController } from './user-bonds.controller';
import { UserBondsService } from './user-bonds.service';

@Module({
  controllers: [UserBondsController],
  providers: [UserBondsService],
})
export class UserBondsModule {}
