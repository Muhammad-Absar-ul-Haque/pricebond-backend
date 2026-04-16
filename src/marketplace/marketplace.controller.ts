import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingStatusDto } from './dto/update-listing-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MarketplaceStatus } from '@prisma/client';

@ApiTags('Marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new marketplace listing' })
  create(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateListingDto,
  ) {
    return this.marketplaceService.createListing(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active marketplace listings (excludes your own)' })
  findAll(@CurrentUser('id') userId: number) {
    return this.marketplaceService.findAllActive(userId);
  }

  @Get('my-listings')
  @ApiOperation({ summary: 'Get all listings created by the current user (with optional status filter)' })
  @ApiQuery({ 
    name: 'status', 
    enum: MarketplaceStatus, 
    required: false,
    description: 'Filter your listings by status (ACTIVE, SOLD, or REMOVED)',
  })
  findMyListings(
    @CurrentUser('id') userId: number,
    @Query('status') status?: MarketplaceStatus,
  ) {
    return this.marketplaceService.findMyListings(userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific listing' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update listing status (SOLD/REMOVED) — seller only' })
  updateStatus(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListingStatusDto,
  ) {
    return this.marketplaceService.updateStatus(userId, id, dto);
  }
}
