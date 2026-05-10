import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AdminMarketplaceManagementService } from './admin-marketplace-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MarketplaceStatus } from '@prisma/client';

@ApiTags('Admin Marketplace Management')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/marketplace')
export class AdminMarketplaceManagementController {
  constructor(
    private readonly marketplaceService: AdminMarketplaceManagementService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all marketplace listings with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: MarketplaceStatus })
  @ApiQuery({ name: 'denomination', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by serial or seller name/email' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: MarketplaceStatus,
    @Query('denomination', new ParseIntPipe({ optional: true })) denomination?: number,
    @Query('search') search?: string,
  ) {
    return this.marketplaceService.findAll({
      page,
      limit,
      status,
      denomination,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed view of a listing' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update listing status' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: MarketplaceStatus,
  ) {
    return this.marketplaceService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Mark a listing as REMOVED' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.marketplaceService.remove(id);
  }
}
