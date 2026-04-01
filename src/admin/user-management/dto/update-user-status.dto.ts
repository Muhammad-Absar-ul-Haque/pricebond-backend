import { UserStatus } from "@prisma/client";

export class UpdateUserStatusDto {
  status: UserStatus;
}