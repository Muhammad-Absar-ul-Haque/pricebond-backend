import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BondStatus } from "@prisma/client";

@Injectable()
export class ScrutinyService {
  private readonly logger = new Logger(ScrutinyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Scans all UserBonds of a specific denomination and updates their status
   * if they match any winning number for the given draw.
   */
  async scrutinizeDraw(drawId: number) {
    this.logger.log(`Starting scrutiny for draw ${drawId}`);

    const draw = await this.prisma.draw.findUnique({
      where: { id: drawId },
      include: {
        winningNumbers: {
          select: { serial: true },
        },
      },
    });

    if (!draw || draw.winningNumbers.length === 0) {
      this.logger.warn(
        `Draw ${drawId} not found or has no winning numbers. Skipping scrutiny.`,
      );
      return;
    }

    const winningSerials = draw.winningNumbers.map((wn) => wn.serial);

    // Update bonds that match the denomination and the winning serials
    const updateResult = await this.prisma.userBond.updateMany({
      where: {
        denomination: draw.denomination,
        serial: { in: winningSerials },
        status: BondStatus.CHECKED, // Only update those not already flagged
      },
      data: {
        status: BondStatus.WINNER,
      },
    });

    this.logger.log(
      `Scrutiny complete for draw ${drawId}. Found ${updateResult.count} new winners.`,
    );

    return updateResult.count;
  }
}
