import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDrawDto } from './dto/create-draw.dto';
import { PdfParserService } from '../../common/pdf-parser/pdf-parser.service';
import { PrizeTier } from '@prisma/client';
import { ScrutinyService } from '../../common/scrutiny/scrutiny.service';

@Injectable()
export class AdminDrawManagementService {
  private readonly logger = new Logger(AdminDrawManagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfParser: PdfParserService,
    private readonly scrutiny: ScrutinyService,
  ) {}

  async createDraw(dto: CreateDrawDto) {
    return this.prisma.draw.create({
      data: {
        drawNumber: dto.drawNumber,
        date: new Date(dto.date),
        city: dto.city,
        denomination: dto.denomination,
      },
    });
  }

  async listDraws() {
    return this.prisma.draw.findMany({
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { winningNumbers: true },
        },
      },
    });
  }

  async importResultsFromPdf(drawId: number, file: Express.Multer.File) {
    const draw = await this.prisma.draw.findUnique({
      where: { id: drawId },
    });

    if (!draw) {
      throw new NotFoundException('Draw not found');
    }

    const parsedData = await this.pdfParser.parsePrizeBondPdf(file.buffer);

    // Validation
    if (parsedData.denomination !== draw.denomination) {
       this.logger.warn(`PDF denomination (${parsedData.denomination}) mismatch with draw (${draw.denomination})`);
    }

    const winnersToInsert = [
      ...parsedData.winners.first.serials.map((serial) => ({ 
        serial, 
        prizeTier: PrizeTier.FIRST, 
        prizeAmount: parsedData.winners.first.amount,
        drawId 
      })),
      ...parsedData.winners.second.serials.map((serial) => ({ 
        serial, 
        prizeTier: PrizeTier.SECOND, 
        prizeAmount: parsedData.winners.second.amount,
        drawId 
      })),
      ...parsedData.winners.third.serials.map((serial) => ({ 
        serial, 
        prizeTier: PrizeTier.THIRD, 
        prizeAmount: parsedData.winners.third.amount,
        drawId 
      })),
    ];

    if (winnersToInsert.length === 0) {
      throw new BadRequestException('No winning numbers found in the PDF. Please check the file format.');
    }

    // Atomic transaction: Clear previous winners and insert new ones
    await this.prisma.$transaction([
      this.prisma.winningNumber.deleteMany({ where: { drawId } }),
      this.prisma.winningNumber.createMany({ data: winnersToInsert }),
    ]);

    // 🕵️ Trigger Scrutiny for User Bonds
    const newWinnersCount = await this.scrutiny.scrutinizeDraw(drawId);

    return {
      message: 'Results imported and scrutiny complete',
      stats: {
        total: winnersToInsert.length,
        first: parsedData.winners.first.serials.length,
        second: parsedData.winners.second.serials.length,
        third: parsedData.winners.third.serials.length,
        newUserWinners: newWinnersCount,
      },
    };
  }
}
