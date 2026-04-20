import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumberString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

// ─── Register DTO ─────────────────────────────────────────────────────────────
export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  @ApiProperty({ example: 'Alice', description: 'User first name' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  @ApiProperty({ example: 'Johnson', description: 'User last name' })
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @ApiProperty({ example: 'alice@example.com', description: 'User email' })
  email: string;

  @IsNumberString({}, { message: 'Mobile number must contain only digits' })
  @MinLength(10, { message: 'Mobile number must be at least 10 digits' })
  @MaxLength(15, { message: 'Mobile number must not exceed 15 digits' })
  @ApiProperty({ example: '03001234567', description: 'Mobile number' })
  mobile: string;

  @IsString()
  @IsNotEmpty({ message: 'PIN is required' })
  @MinLength(4, { message: 'PIN must be 4 characters' })
  @MaxLength(4, { message: 'PIN must be 4 characters' })
  @ApiProperty({ example: '1234', description: 'Numeric PIN' })
  pin: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirm PIN is required' })
  @ApiProperty({ example: '1234', description: 'Confirm PIN' })
  confirmPin: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @ApiProperty({ example: '123 Main St', description: 'Address' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  @ApiProperty({ example: 'Karachi', description: 'City' })
  city: string;

  @IsEnum(Role, { message: 'Role must be either USER or ADMIN' })
  @IsOptional()
  @ApiProperty({ example: 'USER', description: 'User role', required: false })
  role?: Role;
}

// ─── Login DTO ────────────────────────────────────────────────────────────────
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @ApiProperty({ example: 'alice@example.com', description: 'User email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'PIN is required' })
  @MinLength(4, { message: 'PIN must be 4 characters' })
  @MaxLength(4, { message: 'PIN must be 4 characters' })
  @ApiProperty({ example: '1234', description: 'Numeric PIN' })
  pin: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'fcm_token_string_here',
    description: 'Firebase Cloud Messaging token for push notifications',
    required: false,
  })
  fcmToken?: string;
}

// ─── Send OTP DTO ─────────────────────────────────────────────────────────────
export class SendOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @ApiProperty({ example: 'alice@example.com', description: 'User email' })
  email: string;
}

// ─── Verify OTP DTO ───────────────────────────────────────────────────────────
export class VerifyOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @ApiProperty({ example: 'alice@example.com', description: 'User email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'OTP code is required' })
  @MinLength(4, { message: 'OTP must be 4 digits' })
  @MaxLength(4, { message: 'OTP must be 4 digits' })
  @ApiProperty({ example: '1234', description: 'OTP code' })
  otp: string;
}

// ─── Reset PIN DTO ────────────────────────────────────────────────────────────
export class ResetPinDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @ApiProperty({ example: 'alice@example.com', description: 'User email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'New PIN is required' })
  @MinLength(4, { message: 'PIN must be 4 characters' })
  @MaxLength(4, { message: 'PIN must be 4 characters' })
  @ApiProperty({ example: '4321', description: 'New PIN' })
  newPin: string;

  @IsString()
  @IsNotEmpty({ message: 'Confirm PIN is required' })
  @ApiProperty({ example: '4321', description: 'Confirm new PIN' })
  confirmPin: string;
}
