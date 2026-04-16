import { Controller, Get, Patch, Param, Body, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { UserManagementService } from './admin-user-management.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Admin - User Management')
@Controller('admin/user-management')
@UseGuards(RolesGuard)
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
  @ApiParam({ name: 'id', description: 'ID of the user to update', example: 1 })
  @ApiBody({ type: UpdateUserStatusDto })
  async updateStatus(@Param('id', ParseIntPipe) userId: number, @Body() dto: UpdateUserStatusDto) {
    return this.userManagementService.updateUserStatus(userId, dto);
  }
}