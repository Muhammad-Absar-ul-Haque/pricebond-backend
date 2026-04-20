import { Controller, Get, Patch, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Fetch current user notifications with optional filtering.
   */
  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read/unread status' })
  async getMyNotifications(
    @CurrentUser('id') userId: number,
    @Query('isRead') isRead?: string,
  ) {
    // Convert string query param to boolean
    let filter: boolean | undefined = undefined;
    if (isRead === 'true') filter = true;
    if (isRead === 'false') filter = false;

    const notifications = await this.notificationsService.getUserNotifications(userId, filter);
    
    return {
      success: true,
      count: notifications.length,
      notifications,
    };
  }

  /**
   * Mark all notifications for the current user as read.
   */
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser('id') userId: number) {
    await this.notificationsService.markAllAsRead(userId);
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  /**
   * Mark a specific notification as read.
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  async markAsRead(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    await this.notificationsService.markAsRead(notificationId, userId);
    return {
      success: true,
      message: 'Notification marked as read',
    };
  }
}
