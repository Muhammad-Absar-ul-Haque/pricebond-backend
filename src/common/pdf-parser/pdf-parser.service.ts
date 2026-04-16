import { Injectable, Logger } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

export interface ParsedDrawData {
  drawNumber: string;
  denomination: number;
  date: Date;
  winners: {
    first: { serials: string[]; amount: number };
    second: { serials: string[]; amount: number };
    third: { serials: string[]; amount: number };
  };
}

@Injectable()
export class PdfParserService {
  private readonly logger = new Logger(PdfParserService.name);

  async parsePrizeBondPdf(fileBuffer: Buffer): Promise<ParsedDrawData> {
    try {
      const parser = new PDFParse({ data: fileBuffer });
      const data = await parser.getText();
      const text = data.text;

      return this.extractData(text);
    } catch (error) {
      this.logger.error('Failed to parse PDF', error);
      throw new Error('Could not parse the PDF file. Ensure it is a valid text-based PDF.');
    }
  }

  private extractData(text: string): ParsedDrawData {
    // 1. Extract Denomination (e.g., Rs. 750/-)
    const denominationMatch = text.match(/Rs\.\s*(\d+)\/-|(\d+)\s*denomination/i);
    const denomination = denominationMatch ? parseInt(denominationMatch[1] || denominationMatch[2]) : 0;

    // 2. Extract Draw Number (e.g., 102nd Draw)
    const drawMatch = text.match(/(\d+)(?:st|nd|rd|th)\s+Draw/i);
    const drawNumber = drawMatch ? drawMatch[1] : 'Unknown';

    // 3. Extract Date (e.g., Dated: 15-04-2024)
    const dateMatch = text.match(/Dated:\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/i);
    const date = dateMatch ? new Date(dateMatch[1].split(/[-/.]/).reverse().join('-')) : new Date();

    // 4. Extract Winners using Prize Headers as anchors
    const firstPrizeText = this.getSection(text, 'First Prize', 'Second Prize');
    const secondPrizeText = this.getSection(text, 'Second Prize', 'Third Prize');
    const thirdPrizeText = this.getSection(text, 'Third Prize', 'List of');

    const winners = {
      first: {
        serials: this.extractSerials(firstPrizeText),
        amount: this.extractPrizeAmount(firstPrizeText),
      },
      second: {
        serials: this.extractSerials(secondPrizeText),
        amount: this.extractPrizeAmount(secondPrizeText),
      },
      third: {
        serials: this.extractSerials(thirdPrizeText),
        amount: this.extractPrizeAmount(thirdPrizeText),
      },
    };

    return {
      drawNumber,
      denomination,
      date,
      winners,
    };
  }

  private getSection(text: string, startKey: string, endKey: string): string {
    const startIndex = text.indexOf(startKey);
    if (startIndex === -1) return '';
    
    const endIndex = text.indexOf(endKey, startIndex);
    if (endIndex === -1) return text.substring(startIndex);
    
    return text.substring(startIndex, endIndex);
  }

  private extractSerials(text: string): string[] {
    if (!text) return [];
    // Match 6-digit numbers isolated by non-digit characters
    const matches = text.match(/\b\d{6}\b/g);
    return matches ? [...new Set(matches)] : []; // Remove duplicates
  }

  private extractPrizeAmount(text: string): number {
    if (!text) return 0;
    // Extract amount like "750,000" or "1,250" from "Rs. 750,000/-"
    const match = text.match(/Rs\.\s*([\d,]+)\/-/);
    if (!match) return 0;
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
}
