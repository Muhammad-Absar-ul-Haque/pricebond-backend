import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { UserManagementService } from './admin-user-management.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Admin - User Management')
@ApiBearerAuth()
@Controller('admin/user-management')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  // ─── List users by status ───────────────────────────────────────────────
  @Get('users')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List users filtered by status' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter users by status: PENDING, ACTIVE, or REJECTED',
    example: 'PENDING',
  })
  async listUsers(@Query() query: ListUsersDto) {
    return this.userManagementService.listUsers(query.status);
  }

  // ─── Approve or Reject a user ──────────────────────────────────────────
  @Patch('users/:id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user status (approve/reject)' })
  @ApiParam({ name: 'id', description: 'ID of the user to update', example: 'cuid12345' })
  @ApiBody({ type: UpdateUserStatusDto })
  async updateStatus(@Param('id') userId: string, @Body() dto: UpdateUserStatusDto) {
    return this.userManagementService.updateUserStatus(userId, dto);
  }
}