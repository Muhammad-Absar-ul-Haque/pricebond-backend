import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../common/email/email.service";
import {
  RegisterDto,
  LoginDto,
  SendOtpDto,
  VerifyOtpDto,
  ResetPinDto,
} from "./dto/auth.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // ─── Register ───────────────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Check PIN match
    if (dto.pin !== dto.confirmPin) {
      throw new BadRequestException("PIN and Confirm PIN do not match.");
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("An account with this email already exists.");
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(dto.pin, 10);

    // Create user
    await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        mobile: dto.mobile,
        pin: hashedPin,
        address: dto.address,
        city: dto.city,
        role: dto.role || "USER",
      },
    });

    return {
      success: true,
      message:
        "Thank you for registration. Your profile will be reviewed by admin. You will be able to login once approved.",
    };
  }

  // ─── Login ──────────────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or PIN.");
    }

    const isPinValid = await bcrypt.compare(dto.pin, user.pin);
    if (!isPinValid) {
      throw new UnauthorizedException("Invalid email or PIN.");
    }

    // 🔒 STATUS CHECKS (CRITICAL)
    if (user.status === "PENDING") {
      throw new ForbiddenException(
        "Your profile is under review. You will be able to login once approved by admin.",
      );
    }

    if (user.status === "REJECTED") {
      throw new ForbiddenException(
        "Your registration was rejected by admin. Please contact support.",
      );
    }

    // ✅ Only ACTIVE users reach here
    const payload = {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        city: user.city,
      },
    };
  }
  // ─── Send OTP ────────────────────────────────────────────────────────────────
  async sendOtp(dto: SendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException("No account found with this email address.");
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await this.prisma.user.update({
      where: { email: dto.email.toLowerCase() },
      data: {
        otpCode,
        otpExpiresAt,
        otpVerified: false,
      },
    });

    // 📧 SEND OTP via EmailService (Handles MOCK/REAL automatically)
    const subject = "Your PrizeBond OTP Code";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Reset Your PIN</h2>
        <p>Your OTP code is: <strong style="font-size: 24px; color: #4A90E2;">${otpCode}</strong></p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    try {
      await this.emailService.sendMail(user.email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${user.email}`, error.stack);
      // We don't throw here to allow the user to see the "sent" message
      // (The admin can see the OTP in logs if in MOCK mode or if failure logging is enabled)
    }

    return {
      success: true,
      message: `OTP has been sent to ${dto.email}`,
    };
  }

  // ─── Verify OTP ──────────────────────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException("No account found with this email address.");
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException(
        "No OTP was requested. Please request a new OTP.",
      );
    }

    // Check expiry
    if (new Date() > user.otpExpiresAt) {
      // Clear expired OTP
      await this.prisma.user.update({
        where: { email: dto.email.toLowerCase() },
        data: { otpCode: null, otpExpiresAt: null, otpVerified: false },
      });
      throw new BadRequestException(
        "OTP has expired. Please request a new one.",
      );
    }

    // Check OTP match
    if (user.otpCode !== dto.otp) {
      throw new BadRequestException("Invalid OTP. Please try again.");
    }

    // Mark OTP as verified (but don't clear yet — needed for reset-pin check)
    await this.prisma.user.update({
      where: { email: dto.email.toLowerCase() },
      data: { otpVerified: true },
    });

    return {
      success: true,
      message: "OTP verified successfully!",
    };
  }

  // ─── Reset PIN ────────────────────────────────────────────────────────────────
  async resetPin(dto: ResetPinDto) {
    if (dto.newPin !== dto.confirmPin) {
      throw new BadRequestException("New PIN and Confirm PIN do not match.");
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException("No account found with this email address.");
    }

    // Ensure OTP was verified before allowing PIN reset
    if (!user.otpVerified) {
      throw new UnauthorizedException(
        "OTP not verified. Please verify your OTP first.",
      );
    }

    // Hash new PIN
    const hashedPin = await bcrypt.hash(dto.newPin, 10);

    // Update PIN and clear all OTP fields
    await this.prisma.user.update({
      where: { email: dto.email.toLowerCase() },
      data: {
        pin: hashedPin,
        otpCode: null,
        otpExpiresAt: null,
        otpVerified: false,
      },
    });

    return {
      success: true,
      message:
        "PIN has been reset successfully! You can now login with your new PIN.",
    };
  }

  // ─── Get Me (protected) ───────────────────────────────────────────────────────
  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        role: true,
        address: true,
        city: true,
        createdAt: true,
        updatedAt: true,
        // pin, otpCode, otpExpiresAt are NEVER returned
      },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return {
      success: true,
      user,
    };
  }
}
