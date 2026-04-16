import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDrawDto {
  @ApiProperty({ example: '102' })
  @IsString()
  @IsNotEmpty()
  drawNumber: string;

  @ApiProperty({ example: '2024-04-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Karachi' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 750 })
  @IsNumber()
  denomination: number;
}
