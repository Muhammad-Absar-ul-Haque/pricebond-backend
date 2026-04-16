import { Controller, Post, Get, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserBondsService } from './user-bonds.service';
import { CreateUserBondDto } from './dto/create-user-bond.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('User - Personal Bonds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('my-bonds')
export class UserBondsController {
  constructor(private readonly userBondsService: UserBondsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new physical bond to your profile' })
  create(@CurrentUser('id') userId: number, @Body() dto: CreateUserBondDto) {
    return this.userBondsService.addBond(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all your saved bonds' })
  findAll(@CurrentUser('id') userId: number) {
    return this.userBondsService.listUserBonds(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a bond from your profile' })
  remove(@CurrentUser('id') userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.userBondsService.removeBond(userId, id);
  }
}
