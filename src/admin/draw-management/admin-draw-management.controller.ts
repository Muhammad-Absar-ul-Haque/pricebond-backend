import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  ParseIntPipe,
  Query,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminDrawManagementService } from './admin-draw-management.service';
import { CreateDrawDto } from './dto/create-draw.dto';
import { BulkCreateDrawDto } from './dto/bulk-create-draw.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

// DTO for the multipart body that optionally carries a pre-signed/cloud URL
class ImportResultBodyDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Result PDF file',
  })
  file: any;

  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    description:
      'Optional public URL override (e.g. S3 / Cloudinary URL). If omitted, a local path is generated.',
    example: 'https://cdn.example.com/results/draw-42.pdf',
  })
  resultFileUrl?: string;
}

@ApiTags('Admin - Draw Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/draws')
export class AdminDrawManagementController {
  constructor(
    private readonly drawService: AdminDrawManagementService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new draw' })
  create(@Body() dto: CreateDrawDto) {
    return this.drawService.createDraw(dto);
  }

  // POST /admin/draws/bulk
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create draws (schedule)' })
  bulkCreate(@Body() dto: BulkCreateDrawDto) {
    return this.drawService.bulkCreateDraws(dto);
  }

  // GET /admin/draws
// Controller
@Get()
@ApiOperation({ summary: 'List all draws (admin view)' })
@ApiQuery({ name: 'denomination', required: false, type: Number })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
findAll(
  @Query('denomination') denomination?: string,
  @Query('page') page?: string,
  @Query('limit') limit?: string,
) {
  return this.drawService.listDraws({
    denomination: denomination ? Number(denomination) : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  });
}
  // GET /admin/draws/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get draw details (admin view)' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drawService.findOne(id);
  }

  // DELETE /admin/draws/:id/pdf
  @Delete(':id/pdf')
  @ApiOperation({
    summary: 'Delete the official result PDF and all associated winning numbers for a draw.',
  })
  deletePdf(@Param('id', ParseIntPipe) id: number) {
    return this.drawService.deletePdf(id);
  }

  @Post(':id/import-results')
  @ApiOperation({
    summary:
      'Upload the official result PDF for a draw. Parses winning numbers and stores the PDF URL for users to download.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportResultBodyDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async importResults(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('resultFileUrl') resultFileUrl?: string,
  ) {
    // 1. Upload to Cloudinary if a file was provided
    let fileUrl = resultFileUrl;
    if (file) {
      fileUrl = await this.cloudinaryService.uploadPdf(file.path);
    }

    // 2. Import results (this reads the file from disk)
    const result = await this.drawService.importResultsFromPdf(id, file, fileUrl);

    // 3. Clean up: delete the local file now that we are done with it
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return result;
  }
}

