import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckResultDto } from './dto/check-result.dto';

@Injectable()
export class DrawsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDraws(denomination?: number) {
    return this.prisma.draw.findMany({
      where: denomination ? { denomination } : {},
      orderBy: { date: 'desc' },
      select: {
        id: true,
        drawNumber: true,
        date: true,
        city: true,
        denomination: true,
        fileUrl: true,
      },
    });
  }

  async checkResult(query: CheckResultDto) {
    const winningBonds = await this.prisma.winningNumber.findMany({
      where: {
        serial: query.serial,
        draw: {
          denomination: query.denomination,
        },
      },
      include: {
        draw: true,
      },
    });

    if (winningBonds.length === 0) {
      return {
        isWinner: false,
        message: 'No result found for this number in our record.',
      };
    }

    return {
      isWinner: true,
      message: `Congratulations! Your number ${query.serial} has won.`,
      wins: winningBonds.map((win) => ({
        drawNumber: win.draw.drawNumber,
        drawDate: win.draw.date,
        city: win.draw.city,
        prizeTier: win.prizeTier,
        prizeAmount: win.prizeAmount,
      })),
    };
  }
}
