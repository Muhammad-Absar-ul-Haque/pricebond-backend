import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator to define required roles on a route handler.
 * Usage: @Roles('ADMIN') or @Roles('USER', 'ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);