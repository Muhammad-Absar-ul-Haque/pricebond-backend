import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserBondDto } from './dto/create-user-bond.dto';
import { BondStatus } from '@prisma/client';

@Injectable()
export class UserBondsService {
  constructor(private readonly prisma: PrismaService) {}

  async addBond(userId: number, dto: CreateUserBondDto) {
    // Check if it's already a winner
    const winningMatch = await this.prisma.winningNumber.findFirst({
      where: {
        serial: dto.serial,
        draw: {
          denomination: dto.denomination,
        },
      },
    });

    return this.prisma.userBond.create({
      data: {
        serial: dto.serial,
        denomination: dto.denomination,
        userId: userId,
        status: winningMatch ? BondStatus.WINNER : BondStatus.CHECKED,
      },
    });
  }

  async listUserBonds(userId: number) {
    const bonds = await this.prisma.userBond.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (bonds.length === 0) return bonds;

    const serials = [...new Set(bonds.map((b) => b.serial))];
    const denominations = [...new Set(bonds.map((b) => b.denomination))];

    const winningNumbers = await this.prisma.winningNumber.findMany({
      where: {
        serial: { in: serials },
        draw: { denomination: { in: denominations } },
      },
      include: { draw: true },
    });

    return bonds.map((bond) => ({
      ...bond,
      wins: winningNumbers
        .filter((w) => w.serial === bond.serial && w.draw.denomination === bond.denomination)
        .map((w) => ({
          drawNumber: w.draw.drawNumber,
          drawDate: w.draw.date,
          city: w.draw.city,
          prizeTier: w.prizeTier,
          prizeAmount: w.prizeAmount,
        })),
    }));
  }

  async removeBond(userId: number, bondId: number) {
    const bond = await this.prisma.userBond.findUnique({
      where: { id: bondId },
    });

    if (!bond || bond.userId !== userId) {
      throw new NotFoundException('Bond not found');
    }

    return this.prisma.userBond.delete({
      where: { id: bondId },
    });
  }
}
