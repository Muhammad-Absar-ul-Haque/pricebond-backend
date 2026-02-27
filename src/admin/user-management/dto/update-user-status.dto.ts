import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'Status must be PENDING, ACTIVE, or REJECTED' })
  @ApiProperty({ example: 'ACTIVE', description: 'New status for the user' })
  status: UserStatus;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Reason for rejection', description: 'Optional reason for rejection', required: false })
  reason?: string;
}