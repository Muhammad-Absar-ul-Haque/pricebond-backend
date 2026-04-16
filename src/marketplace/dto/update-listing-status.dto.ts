import { IsEnum, IsInt, IsOptional, ValidateIf } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MarketplaceStatus } from "@prisma/client";

export class UpdateListingStatusDto {
  @ApiProperty({
    enum: ["SOLD", "REMOVED"],
    description: "New status for the listing",
  })
  @IsEnum(MarketplaceStatus)
  status: MarketplaceStatus;

  @ApiPropertyOptional({
    example: 123,
    description: "Required when status is SOLD",
  })
  @ValidateIf((o) => o.status === "SOLD")
  @IsInt()
  buyerId?: number;
}
