// src/common/guards/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) throw new UnauthorizedException('Invalid or expired token');
    return user;
  }
}

// ──────────────────────────────────────────────────────────────
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}

// ──────────────────────────────────────────────────────────────
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// ──────────────────────────────────────────────────────────────
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.cookies?.admin_token,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: { sub: string; role: string }) {
    // Verify session still exists
    const token =
      req.headers?.authorization?.split(' ')[1] || req.cookies?.admin_token;

    if (token) {
      // Check Redis first (fast path)
      const cachedId = await this.redis.get(`session:${token}`);
      if (cachedId && cachedId !== payload.sub) throw new UnauthorizedException();
      if (!cachedId) {
        // Fallback to DB
        const session = await this.prisma.adminSession.findUnique({ where: { token } });
        if (!session || session.expiresAt < new Date()) throw new UnauthorizedException();
      }
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub, isActive: true },
      select: { id: true, username: true, email: true, role: true },
    });
    if (!admin) throw new UnauthorizedException();
    return admin;
  }
}

// ──────────────────────────────────────────────────────────────
// src/auth/dto/login.dto.ts
import { IsString, IsOptional, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier: string; // email or username

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  totpCode?: string;
}
