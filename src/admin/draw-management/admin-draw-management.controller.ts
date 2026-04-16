import { Controller, Post, Body, Get, Param, UploadedFile, UseInterceptors, UseGuards, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AdminDrawManagementService } from './admin-draw-management.service';
import { CreateDrawDto } from './dto/create-draw.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin - Draw Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/draws')
export class AdminDrawManagementController {
  constructor(private readonly drawService: AdminDrawManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new draw' })
  create(@Body() dto: CreateDrawDto) {
    return this.drawService.createDraw(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all draws' })
  findAll() {
    return this.drawService.listDraws();
  }

  @Post(':id/import-results')
  @ApiOperation({ summary: 'Import winning numbers from official PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  importResults(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    return this.drawService.importResultsFromPdf(id, file);
  }
}
