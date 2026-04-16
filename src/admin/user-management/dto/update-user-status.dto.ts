import { UserStatus } from "@prisma/client";
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus, { message: "Status must be PENDING, ACTIVE, or REJECTED" })
  status: UserStatus;
}