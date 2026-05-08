import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDrawDto } from './create-draw.dto';

export class BulkCreateDrawDto {
  @ApiProperty({ type: [CreateDrawDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDrawDto)
  draws: CreateDrawDto[];
}
