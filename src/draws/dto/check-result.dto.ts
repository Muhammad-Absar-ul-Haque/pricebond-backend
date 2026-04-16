import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckResultDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  serial: string;

  @ApiProperty({ example: 750 })
  @Type(() => Number)
  @IsNumber()
  denomination: number;
}
