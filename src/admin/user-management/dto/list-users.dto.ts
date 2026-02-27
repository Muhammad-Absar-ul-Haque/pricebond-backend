// src/admin/user-management/dto/list-users.dto.ts
import { IsEnum, IsOptional } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListUsersDto {
  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be PENDING, ACTIVE, or REJECTED' })
  @ApiPropertyOptional({ example: 'PENDING', description: 'Filter users by status' })
  status?: UserStatus;
}