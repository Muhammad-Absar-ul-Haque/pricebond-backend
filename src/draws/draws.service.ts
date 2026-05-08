import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CheckResultDto } from "./dto/check-result.dto";

@Injectable()
export class DrawsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── List All Draws ──────────────────────────────────────────────────────────
  async listDraws(
    denomination?: number,
    onlyWithResults = false,
    city?: string,
    date?: string,
  ) {
    const where: any = {};
    if (denomination) where.denomination = denomination;
    if (onlyWithResults) where.resultFileUrl = { not: null };
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = { gte: startDate, lte: endDate };
    }

    const draws = await this.prisma.draw.findMany({
      where,
      orderBy: { date: "desc" },
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
        fileUrl: d.fileUrl ?? null,
        resultFileUrl: d.resultFileUrl ?? null,
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
        _count: {
          select: { winningNumbers: true },
        },
      },
    });

    if (!draw) {
      throw new NotFoundException(`Draw with id ${drawId} not found.`);
    }

    return {
      success: true,
      draw: {
        id: draw.id,
        drawNumber: draw.drawNumber,
        date: draw.date,
        city: draw.city,
        denomination: draw.denomination,
        hasResult: !!draw.resultFileUrl,
        fileUrl: draw.fileUrl ?? null,
        resultFileUrl: draw.resultFileUrl ?? null,
        resultPdfUrl: draw.resultFileUrl ?? null,
        totalWinners: draw._count.winningNumbers,
      },
    };
  }

  // ─── Get Schedule ─────────────────────────────────────────────────────────────
  async getSchedule(year: number, denomination?: number) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const draws = await this.prisma.draw.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        ...(denomination ? { denomination } : {}),
      },
      orderBy: { date: "asc" },
    });

    return {
      success: true,
      year,
      total: draws.length,
      schedule: draws.map((d) => ({
        id: d.id,
        drawNumber: d.drawNumber,
        date: d.date,
        city: d.city,
        denomination: d.denomination,
        hasResult: !!d.resultFileUrl,
      })),
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
        message: "No result found for this number in our record.",
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
