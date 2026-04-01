import { IsEmail, IsString, IsOptional, MinLength, MaxLength, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Alice', description: 'User first name' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Johnson', description: 'User last name' })
  lastName?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Mobile number must contain only digits' })
  @MinLength(10, { message: 'Mobile number must be at least 10 digits' })
  @MaxLength(15, { message: 'Mobile number must not exceed 15 digits' })
  @ApiPropertyOptional({ example: '03001234567', description: 'Mobile number' })
  mobile?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '123 Main St', description: 'Address' })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Karachi', description: 'City' })
  city?: string;
}
