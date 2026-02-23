// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { ZainCashService } from './providers/zaincash.service';
import { QiCardService } from './providers/qicard.service';
import { FibService } from './providers/fib.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { EncryptionModule } from '../common/encryption/encryption.module';

@Module({
  imports: [PrismaModule, EncryptionModule],
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [PaymentsService, ZainCashService, QiCardService, FibService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

// ──────────────────────────────────────────────────────────────
// src/payments/admin-payments.controller.ts
// Full Admin CRUD for payment gateways — all config from DB
import {
  Controller, Get, Put, Body, Param, UseGuards, HttpCode, HttpStatus, Query
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminPaymentsController {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  /** GET /admin/payments/gateways — list all gateways (secrets masked) */
  @Get('gateways')
  async listGateways() {
    const gateways = await this.prisma.paymentGateway.findMany({
      orderBy: { provider: 'asc' },
    });
    return gateways.map((g) => ({
      id: g.id,
      provider: g.provider,
      name: g.name,
      isEnabled: g.isEnabled,
      environment: g.environment,
      // Never expose raw config — show masked
      config: this.maskConfig(g.config as Record<string, string>),
      webhookUrl: g.webhookUrl,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
    }));
  }

  /** GET /admin/payments/gateways/:provider — get single (secrets masked) */
  @Get('gateways/:provider')
  async getGateway(@Param('provider') provider: string) {
    const gw = await this.prisma.paymentGateway.findFirstOrThrow({
      where: { provider },
    });
    return {
      ...gw,
      config: this.maskConfig(gw.config as Record<string, string>),
    };
  }

  /**
   * PUT /admin/payments/gateways/:provider
   * Update gateway — stores API keys encrypted, URLs in DB, NO hardcoding
   * Body example for ZainCash:
   * {
   *   isEnabled: true,
   *   environment: "sandbox",
   *   name: "ZainCash",
   *   webhookUrl: "https://mysite.com/api/v1/payments/zaincash/callback",
   *   config: {
   *     merchantId: "...",
   *     msisdn: "...",
   *     secret: "...",        ← encrypted in DB
   *     apiBaseUrl: "https://test.zaincash.iq",   ← stored in DB, not hardcoded
   *     createPaymentPath: "/api/create",
   *     redirectUrl: "https://mysite.com/payment/complete"
   *   }
   * }
   */
  @Put('gateways/:provider')
  @HttpCode(HttpStatus.OK)
  async updateGateway(
    @Param('provider') provider: string,
    @Body() body: {
      isEnabled?: boolean;
      environment?: string;
      name?: string;
      webhookUrl?: string;
      config?: Record<string, string>;
    },
  ) {
    // Encrypt secrets in config before storing
    let encryptedConfig: Record<string, string> | undefined;
    if (body.config) {
      encryptedConfig = {};
      const secretFields = ['secret', 'apiSecret', 'clientSecret', 'secretKey', 'webhookSecret', 'accessKey'];
      for (const [k, v] of Object.entries(body.config)) {
        if (secretFields.includes(k) && v && !v.startsWith('ENCRYPTED:')) {
          encryptedConfig[k] = 'ENCRYPTED:' + this.encryption.encrypt(v);
        } else {
          encryptedConfig[k] = v;
        }
      }
    }

    const updated = await this.prisma.paymentGateway.upsert({
      where: { provider },
      create: {
        provider,
        name: body.name || provider,
        isEnabled: body.isEnabled ?? false,
        environment: body.environment ?? 'sandbox',
        webhookUrl: body.webhookUrl,
        config: (encryptedConfig || {}) as any,
      },
      update: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.isEnabled !== undefined && { isEnabled: body.isEnabled }),
        ...(body.environment !== undefined && { environment: body.environment }),
        ...(body.webhookUrl !== undefined && { webhookUrl: body.webhookUrl }),
        ...(encryptedConfig !== undefined && { config: encryptedConfig as any }),
      },
    });

    return { success: true, provider: updated.provider, isEnabled: updated.isEnabled };
  }

  /** GET /admin/payments/transactions — transaction log */
  @Get('transactions')
  async getTransactions(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('provider') provider?: string,
  ) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (status) where.status = status;
    if (provider) {
      const gw = await this.prisma.paymentGateway.findFirst({ where: { provider } });
      if (gw) where.gatewayId = gw.id;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { gateway: { select: { provider: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    };
  }

  private maskConfig(config: Record<string, string>): Record<string, string> {
    if (!config) return {};
    const secretFields = ['secret', 'apiSecret', 'clientSecret', 'secretKey', 'webhookSecret', 'accessKey'];
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(config)) {
      result[k] = secretFields.includes(k) ? '••••••••' : v;
    }
    return result;
  }
}
