// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RedisModule } from '../common/redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

// ──────────────────────────────────────────────────────────────

// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async login(dto: LoginDto, ip: string, userAgent: string) {
    // Find admin by email or username
    const admin = await this.prisma.adminUser.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { username: dto.identifier }],
        isActive: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check IP restriction
    if (admin.allowedIps.length > 0 && !admin.allowedIps.includes(ip)) {
      throw new ForbiddenException('Access denied from this IP');
    }

    // Check lockout
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new ForbiddenException('Account temporarily locked');
    }

    // Verify password
    const valid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!valid) {
      const attempts = admin.loginAttempts + 1;
      const maxAttempts = 5;
      await this.prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          loginAttempts: attempts,
          lockedUntil:
            attempts >= maxAttempts
              ? new Date(Date.now() + 15 * 60 * 1000)
              : null,
        },
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Handle 2FA
    if (admin.twoFactorEnabled) {
      if (!dto.totpCode) {
        return { requiresTwoFactor: true };
      }
      const verified = speakeasy.totp.verify({
        secret: admin.twoFactorSecret!,
        encoding: 'base32',
        token: dto.totpCode,
        window: 1,
      });
      if (!verified) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    // Reset attempts
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // Create session
    const token = this.jwt.sign({ sub: admin.id, role: admin.role });
    await this.prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token,
        ipAddress: ip,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Cache session in Redis
    await this.redis.set(`session:${token}`, admin.id, 7 * 24 * 3600);

    return {
      access_token: token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async logout(token: string) {
    await this.prisma.adminSession.deleteMany({ where: { token } });
    await this.redis.del(`session:${token}`);
  }

  async logoutAllDevices(adminId: string) {
    const sessions = await this.prisma.adminSession.findMany({
      where: { adminId },
    });
    for (const session of sessions) {
      await this.redis.del(`session:${session.token}`);
    }
    await this.prisma.adminSession.deleteMany({ where: { adminId } });
  }

  async setupTwoFactor(adminId: string) {
    const admin = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id: adminId },
    });
    const secret = speakeasy.generateSecret({
      name: `PhoneSpec:${admin.email}`,
      issuer: 'PhoneSpec Admin',
    });
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { twoFactorSecret: secret.base32 },
    });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
    return { secret: secret.base32, qrCode: qrCodeUrl };
  }

  async enableTwoFactor(adminId: string, token: string) {
    const admin = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id: adminId },
    });
    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret!,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) throw new BadRequestException('Invalid token');
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { twoFactorEnabled: true },
    });
    return { message: '2FA enabled' };
  }

  async disableTwoFactor(adminId: string, token: string) {
    const admin = await this.prisma.adminUser.findUniqueOrThrow({
      where: { id: adminId },
    });
    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret!,
      encoding: 'base32',
      token,
      window: 1,
    });
    if (!verified) throw new BadRequestException('Invalid token');
    await this.prisma.adminUser.update({
      where: { id: adminId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return { message: '2FA disabled' };
  }

  async validateToken(token: string): Promise<string | null> {
    const adminId = await this.redis.get(`session:${token}`);
    if (!adminId) {
      const session = await this.prisma.adminSession.findUnique({
        where: { token },
      });
      if (!session || session.expiresAt < new Date()) return null;
      return session.adminId;
    }
    return adminId;
  }
}
