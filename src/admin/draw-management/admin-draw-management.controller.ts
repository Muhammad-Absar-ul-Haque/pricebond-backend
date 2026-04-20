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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  constructor(private readonly drawService: AdminDrawManagementService) {}

  // POST /admin/draws
  @Post()
  @ApiOperation({ summary: 'Create a new draw' })
  create(@Body() dto: CreateDrawDto) {
    return this.drawService.createDraw(dto);
  }

  // GET /admin/draws
  @Get()
  @ApiOperation({ summary: 'List all draws (admin view)' })
  @ApiQuery({ name: 'denomination', required: false, type: Number })
  findAll(@Query('denomination') denomination?: string) {
    return this.drawService.listDraws();
  }

  // POST /admin/draws/:id/import-results
  @Post(':id/import-results')
  @ApiOperation({
    summary:
      'Upload the official result PDF for a draw. Parses winning numbers and stores the PDF URL for users to download.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportResultBodyDto })
  @UseInterceptors(FileInterceptor('file'))
  async importResults(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('resultFileUrl') resultFileUrl?: string,
  ) {
    // Build a fallback URL from the file's stored path or original name.
    // In production replace this with your actual file-storage URL (S3, Cloudinary, etc.).
    const fileUrl =
      resultFileUrl ||
      (file.path
        ? `${process.env.APP_URL || 'http://localhost:3000'}/uploads/${file.filename ?? file.originalname}`
        : undefined);

    return this.drawService.importResultsFromPdf(id, file, fileUrl);
  }
}

