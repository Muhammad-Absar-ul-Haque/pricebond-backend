import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserBondDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  serial: string;

  @ApiProperty({ example: 750 })
  @IsNumber()
  denomination: number;
}
