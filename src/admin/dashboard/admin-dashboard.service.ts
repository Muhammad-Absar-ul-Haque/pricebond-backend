import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalActiveUsers,
      totalPendingUsers,
      totalBondsRegistered,
      totalWinners,
      activeMarketplaceListings,
      pendingDraws,
      recentWinners,
      latestSales
    ] = await Promise.all([
      // 👥 Total Active Users
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      
      // ⏳ Pending User Approvals
      this.prisma.user.findMany({
        where: { status: 'PENDING' },
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
        take: 5,
        orderBy: { createdAt: 'desc' }
      }),

      // 🎫 Total Bonds Registered
      this.prisma.userBond.count(),

      // 🏆 Total Winners Found
      this.prisma.userBond.count({ where: { status: 'WINNER' } }),

      // 🛒 Active Marketplace Listings
      this.prisma.marketplaceListing.count({ where: { status: 'ACTIVE' } }),

      // 📄 Draws Missing Results
      this.prisma.draw.findMany({
        where: {
          date: { lt: new Date() },
          resultFileUrl: null,
        },
        select: { id: true, drawNumber: true, denomination: true, city: true, date: true },
        orderBy: { date: 'asc' },
        take: 5
      }),

      // Recent Winners
      this.prisma.userBond.findMany({
        where: { status: 'WINNER' },
        select: { serial: true, denomination: true, user: { select: { firstName: true, lastName: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 5
      }),

      // Latest Marketplace Sales
      this.prisma.marketplaceListing.findMany({
        where: { status: 'SOLD' },
        select: { serial: true, denomination: true, seller: { select: { firstName: true } }, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 5
      })
    ]);

    // Pending Users Count
    const totalPendingCount = await this.prisma.user.count({ where: { status: 'PENDING' } });

    // Denomination Distribution
    const denominationGroups = await this.prisma.userBond.groupBy({
      by: ['denomination'],
      _count: true,
    });

    const denominationStats = denominationGroups.map(group => ({
      denomination: group.denomination,
      count: group._count
    }));

    return {
      success: true,
      data: {
        kpi: {
          totalActiveUsers,
          totalPendingCount,
          totalBondsRegistered,
          totalWinners,
          activeMarketplaceListings
        },
        actionRequired: {
          pendingUsers: totalPendingUsers,
          drawsMissingResults: pendingDraws
        },
        recentActivity: {
          recentWinners,
          latestSales
        },
        charts: {
          bondsByDenomination: denominationStats
        }
      }
    };
  }
}
