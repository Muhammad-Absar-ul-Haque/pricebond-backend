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
    return this.prisma.userBond.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
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
