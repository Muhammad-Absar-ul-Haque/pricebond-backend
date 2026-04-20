import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BondStatus, NotificationType } from "@prisma/client";
import { NotificationsService } from "../../notifications/notifications.service";

@Injectable()
export class ScrutinyService {
  private readonly logger = new Logger(ScrutinyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

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

    // 1. Find all user bonds that match these serials and denomination
    const winners = await this.prisma.userBond.findMany({
      where: {
        denomination: draw.denomination,
        serial: { in: winningSerials },
        status: BondStatus.CHECKED,
      },
      select: {
        id: true,
        userId: true,
        serial: true,
      },
    });

    if (winners.length === 0) {
      this.logger.log(`Scrutiny complete for draw ${drawId}. No new winners found.`);
      return 0;
    }

    // 2. Update statuses to WINNER
    await this.prisma.userBond.updateMany({
      where: { id: { in: winners.map((w) => w.id) } },
      data: { status: BondStatus.WINNER },
    });

    // 3. Send notifications to each winner
    for (const winner of winners) {
      try {
        await this.notifications.sendPushNotification(
          winner.userId,
          "Congratulations! You Won! 🏆",
          `Winning number match! Your bond ${winner.serial} has won a prize in the ${draw.denomination} denomination draw.`,
          NotificationType.WIN_ALERT,
          { 
            drawId: String(draw.id), 
            bondSerial: winner.serial,
            bondId: String(winner.id)
          }
        );
      } catch (error) {
        this.logger.error(`Error notifying user ${winner.userId} for bond ${winner.serial}: ${error.message}`);
      }
    }

    this.logger.log(
      `Scrutiny complete for draw ${drawId}. Found and notified ${winners.length} new winners.`,
    );

    return winners.length;
  }
}
