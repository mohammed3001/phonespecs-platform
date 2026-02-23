// src/cloudflare/cloudflare.module.ts
import { Module } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { AdminCloudflareController } from './admin-cloudflare.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { EncryptionModule } from '../common/encryption/encryption.module';

@Module({
  imports: [PrismaModule, EncryptionModule],
  controllers: [AdminCloudflareController],
  providers: [CloudflareService],
  exports: [CloudflareService],
})
export class CloudflareModule {}

// ──────────────────────────────────────────────────────────────
// src/cloudflare/admin-cloudflare.controller.ts
import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../common/prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';

@Controller('admin/cloudflare')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminCloudflareController {
  constructor(
    private cf: CloudflareService,
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) {}

  /** GET /admin/cloudflare/config */
  @Get('config')
  async getConfig() {
    const cfg = await this.prisma.cloudflareConfig.findFirst();
    if (!cfg) return { configured: false };
    return {
      configured: true,
      accountId: cfg.accountId,
      zoneId: cfg.zoneId,
      cdnEnabled: cfg.cdnEnabled,
      wafEnabled: cfg.wafEnabled,
      isActive: cfg.isActive,
      // Never expose raw API key
      hasApiKey: !!cfg.apiKey,
    };
  }

  /** PUT /admin/cloudflare/config — save credentials */
  @Put('config')
  @HttpCode(HttpStatus.OK)
  async saveConfig(@Body() body: {
    apiKey: string;
    accountId: string;
    zoneId: string;
    cdnEnabled?: boolean;
    wafEnabled?: boolean;
  }) {
    const result = await this.cf.updateConfig(body);
    return { success: true, accountId: result.accountId, zoneId: result.zoneId };
  }

  /** GET /admin/cloudflare/zone — zone info */
  @Get('zone')
  async getZone() {
    return this.cf.getZoneInfo();
  }

  /** GET /admin/cloudflare/analytics */
  @Get('analytics')
  async getAnalytics(
    @Query('since') since = '-1440',
    @Query('until') until = '0',
  ) {
    return this.cf.getAnalytics(since, until);
  }

  // ── Cache ───────────────────────────────────────────────────

  /** POST /admin/cloudflare/cache/purge-all */
  @Post('cache/purge-all')
  @HttpCode(HttpStatus.OK)
  async purgeAll() {
    const result = await this.cf.purgeAllCache();
    return { success: true, result };
  }

  /** POST /admin/cloudflare/cache/purge-urls */
  @Post('cache/purge-urls')
  @HttpCode(HttpStatus.OK)
  async purgeUrls(@Body() body: { urls: string[] }) {
    const result = await this.cf.purgeUrls(body.urls);
    return { success: true, result };
  }

  /** PATCH /admin/cloudflare/cache/level */
  @Post('cache/level')
  @HttpCode(HttpStatus.OK)
  async setCacheLevel(@Body() body: { level: 'aggressive' | 'basic' | 'simplified' | 'no_query_string' }) {
    const result = await this.cf.setCachingLevel(body.level);
    return { success: true, result };
  }

  // ── CDN ────────────────────────────────────────────────────

  /** POST /admin/cloudflare/cdn/toggle */
  @Post('cdn/toggle')
  @HttpCode(HttpStatus.OK)
  async toggleCdn(@Body() body: { enabled: boolean }) {
    await this.prisma.cloudflareConfig.updateMany({
      data: { cdnEnabled: body.enabled },
    });
    return { success: true, cdnEnabled: body.enabled };
  }

  // ── WAF ────────────────────────────────────────────────────

  /** POST /admin/cloudflare/waf/toggle */
  @Post('waf/toggle')
  @HttpCode(HttpStatus.OK)
  async toggleWaf(@Body() body: { enabled: boolean }) {
    const result = await this.cf.toggleWaf(body.enabled);
    await this.prisma.cloudflareConfig.updateMany({
      data: { wafEnabled: body.enabled },
    });
    return { success: true, result };
  }

  // ── DNS Records ─────────────────────────────────────────────

  /** GET /admin/cloudflare/dns */
  @Get('dns')
  async getDnsRecords() {
    return this.cf.getDnsRecords();
  }

  /** POST /admin/cloudflare/dns */
  @Post('dns')
  async createDnsRecord(@Body() body: {
    type: string;
    name: string;
    content: string;
    ttl?: number;
    proxied?: boolean;
  }) {
    return this.cf.createDnsRecord(body);
  }

  /** PUT /admin/cloudflare/dns/:recordId */
  @Put('dns/:recordId')
  async updateDnsRecord(@Param('recordId') id: string, @Body() body: any) {
    return this.cf.updateDnsRecord(id, body);
  }

  /** DELETE /admin/cloudflare/dns/:recordId */
  @Delete('dns/:recordId')
  @HttpCode(HttpStatus.OK)
  async deleteDnsRecord(@Param('recordId') id: string) {
    return this.cf.deleteDnsRecord(id);
  }
}
