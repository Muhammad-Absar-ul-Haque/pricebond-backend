import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DrawsService } from './draws.service';
import { CheckResultDto } from './dto/check-result.dto';

@ApiTags('Public - Draws & Results')
@Controller('results')
export class DrawsController {
  constructor(private readonly drawsService: DrawsService) {}

  @Get()
  @ApiOperation({ summary: 'List all prize bond draws' })
  @ApiQuery({ name: 'denomination', required: false, type: Number })
  findAll(@Query('denomination') denomination?: string) {
    return this.drawsService.listDraws(denomination ? +denomination : undefined);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if a specific bond serial number has won' })
  check(@Query() query: CheckResultDto) {
    return this.drawsService.checkResult(query);
  }
}
