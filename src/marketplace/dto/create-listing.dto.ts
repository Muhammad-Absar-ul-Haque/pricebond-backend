import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateListingDto {
  @ApiProperty({ example: '123456', description: 'Bond serial number' })
  @IsString()
  @IsNotEmpty()
  serial: string;

  @ApiProperty({ example: 750, description: 'Bond denomination (e.g. 200, 750, 1500)' })
  @IsInt()
  @Min(1)
  denomination: number;

  @ApiPropertyOptional({ example: 'Selling my 750 denom bond, good serial', description: 'Optional notes about the bond' })
  @IsString()
  @IsOptional()
  bondDetails?: string;
}
