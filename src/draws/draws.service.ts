import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckResultDto } from './dto/check-result.dto';

@Injectable()
export class DrawsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── List All Draws ──────────────────────────────────────────────────────────
  async listDraws(denomination?: number) {
    const draws = await this.prisma.draw.findMany({
      where: denomination ? { denomination } : {},
      orderBy: { date: 'desc' },
      select: {
        id: true,
        drawNumber: true,
        date: true,
        city: true,
        denomination: true,
        fileUrl: true,
        resultFileUrl: true,
        _count: {
          select: { winningNumbers: true },
        },
      },
    });

    return {
      success: true,
      total: draws.length,
      draws: draws.map((d) => ({
        id: d.id,
        drawNumber: d.drawNumber,
        date: d.date,
        city: d.city,
        denomination: d.denomination,
        hasResult: !!d.resultFileUrl,
        resultPdfUrl: d.resultFileUrl ?? null,
        winningNumbersCount: d._count.winningNumbers,
      })),
    };
  }

  // ─── Get Single Draw Detail ──────────────────────────────────────────────────
  async getDrawDetail(drawId: number) {
    const draw = await this.prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        winningNumbers: {
          orderBy: { prizeTier: 'asc' },
          select: {
            id: true,
            serial: true,
            prizeTier: true,
            prizeAmount: true,
          },
        },
      },
    });

    if (!draw) {
      throw new NotFoundException(`Draw with id ${drawId} not found.`);
    }

    // Group winning numbers by tier for convenience
    const grouped = {
      FIRST: draw.winningNumbers
        .filter((w) => w.prizeTier === 'FIRST')
        .map((w) => ({ serial: w.serial, prizeAmount: w.prizeAmount })),
      SECOND: draw.winningNumbers
        .filter((w) => w.prizeTier === 'SECOND')
        .map((w) => ({ serial: w.serial, prizeAmount: w.prizeAmount })),
      THIRD: draw.winningNumbers
        .filter((w) => w.prizeTier === 'THIRD')
        .map((w) => ({ serial: w.serial, prizeAmount: w.prizeAmount })),
    };

    return {
      success: true,
      draw: {
        id: draw.id,
        drawNumber: draw.drawNumber,
        date: draw.date,
        city: draw.city,
        denomination: draw.denomination,
        hasResult: !!draw.resultFileUrl,
        resultPdfUrl: draw.resultFileUrl ?? null,   // ← downloadable PDF URL
        totalWinners: draw.winningNumbers.length,
        winners: grouped,
      },
    };
  }

  // ─── Check Result ─────────────────────────────────────────────────────────────
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
