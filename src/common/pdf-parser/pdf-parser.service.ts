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
    
    // For the third prize, we take everything from "Third Prize" to the end of the document.
    // This prevents truncation if phrases like "List of" appear before the actual numbers.
    const thirdPrizeStartIndex = text.indexOf('Third Prize');
    const thirdPrizeText = thirdPrizeStartIndex !== -1 ? text.substring(thirdPrizeStartIndex) : '';

    const winners = {
      first: {
        serials: this.extractSerials(firstPrizeText),
        amount: this.extractPrizeAmount(firstPrizeText, '1st'),
      },
      second: {
        serials: this.extractSerials(secondPrizeText),
        amount: this.extractPrizeAmount(secondPrizeText, '2nd'),
      },
      third: {
        serials: this.extractSerials(thirdPrizeText),
        amount: this.extractPrizeAmount(thirdPrizeText, '3rd'),
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

  private extractPrizeAmount(text: string, positionLabel: '1st' | '2nd' | '3rd'): number {
    if (!text) return 0;

    // Legacy layout: "Rs. 750,000/-"
    const legacyMatch = text.match(/Rs\.\s*([\d,]+)\/-/);
    if (legacyMatch) {
      return parseInt(legacyMatch[1].replace(/,/g, ''), 10);
    }

    // Pakbond table layout: "1st  1  5,00,000  4,25,000  3,50,000"
    // columns are Prize | Total Prizes | Prize Value | For Filer | For Non-Filer
    // capture the Prize Value column (first number after the total-prizes count)
    const rowMatch = text.match(new RegExp(`\\b${positionLabel}\\s+[\\d,]+\\s+([\\d,]+)`, 'i'));
    if (rowMatch) {
      return parseInt(rowMatch[1].replace(/,/g, ''), 10);
    }

    this.logger.warn(`Could not extract prize amount for position "${positionLabel}" — defaulting to 0. Check PDF layout.`);
    return 0;
  }
}
