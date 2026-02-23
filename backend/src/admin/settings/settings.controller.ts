// src/admin/settings/settings.controller.ts
import {
  Controller, Get, Patch, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private settings: SettingsService) {}

  /** GET /admin/settings — all settings grouped (secrets masked) */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getAll() {
    return this.settings.getAllGrouped();
  }

  /** PATCH /admin/settings — batch update */
  @Patch()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  async updateBatch(@Body() body: Record<string, string | boolean | number>) {
    await this.settings.updateBatch(body);
    return { success: true, message: 'Settings updated successfully' };
  }
}

// ─── Settings Module ──────────────────────────────────────────
// src/admin/settings/settings.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

// ─── Public Settings Controller ───────────────────────────────
// src/settings/public-settings.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('settings')
export class PublicSettingsController {
  constructor(private settings: SettingsService) {}

  /** GET /settings/public — safe subset for frontend */
  @Get('public')
  async getPublic() {
    return this.settings.getPublicSettings();
  }
}
