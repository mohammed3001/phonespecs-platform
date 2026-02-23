// src/common/languages/languages.module.ts
import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { AdminLanguagesController } from './admin-languages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [LanguagesController, AdminLanguagesController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}

// ──────────────────────────────────────────────────────────────
// src/common/languages/languages.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async getActive() {
    return this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAll() {
    return this.prisma.language.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async create(dto: {
    code: string; name: string; nativeName: string;
    direction: 'ltr' | 'rtl'; isDefault?: boolean; flagIcon?: string;
  }) {
    const existing = await this.prisma.language.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Language "${dto.code}" already exists`);

    if (dto.isDefault) {
      await this.prisma.language.updateMany({ data: { isDefault: false } });
    }
    const lang = await this.prisma.language.create({ data: { ...dto, isActive: true } });
    await this.invalidateCache();
    return lang;
  }

  async update(code: string, dto: Partial<{
    name: string; nativeName: string; direction: string;
    isDefault: boolean; isActive: boolean; sortOrder: number; flagIcon: string;
  }>) {
    const lang = await this.prisma.language.findUnique({ where: { code } });
    if (!lang) throw new NotFoundException(`Language "${code}" not found`);

    if (dto.isDefault) {
      await this.prisma.language.updateMany({ data: { isDefault: false } });
    }
    const updated = await this.prisma.language.update({ where: { code }, data: dto });
    await this.invalidateCache();
    return updated;
  }

  async delete(code: string) {
    const lang = await this.prisma.language.findUnique({ where: { code } });
    if (!lang) throw new NotFoundException();
    if (lang.isDefault) throw new ConflictException('Cannot delete the default language');

    await this.prisma.language.delete({ where: { code } });
    await this.invalidateCache();
  }

  /** Get all translations for a language (for frontend consumption) */
  async getTranslations(languageCode: string, namespace?: string) {
    const where: any = { languageId: '' };

    const lang = await this.prisma.language.findUnique({ where: { code: languageCode } });
    if (!lang) throw new NotFoundException(`Language "${languageCode}" not found`);

    where.languageId = lang.id;
    if (namespace) where.namespace = namespace;

    const translations = await this.prisma.translation.findMany({
      where,
      orderBy: [{ namespace: 'asc' }, { key: 'asc' }],
    });

    // Return as nested { namespace: { key: value } }
    const result: Record<string, Record<string, string>> = {};
    for (const t of translations) {
      if (!result[t.namespace]) result[t.namespace] = {};
      result[t.namespace][t.key] = t.value;
    }
    return result;
  }

  /** Upsert translation (Admin UI saves individual keys) */
  async upsertTranslation(languageCode: string, namespace: string, key: string, value: string) {
    const lang = await this.prisma.language.findUniqueOrThrow({ where: { code: languageCode } });
    const translation = await this.prisma.translation.upsert({
      where: { languageId_namespace_key: { languageId: lang.id, namespace, key } },
      create: { languageId: lang.id, namespace, key, value },
      update: { value },
    });
    await this.redis.del(`translations:${languageCode}:${namespace}`);
    return translation;
  }

  /** Bulk upsert translations (e.g. import from JSON) */
  async upsertTranslationsBulk(
    languageCode: string,
    data: Array<{ namespace: string; key: string; value: string }>,
  ) {
    const lang = await this.prisma.language.findUniqueOrThrow({ where: { code: languageCode } });
    await this.prisma.$transaction(
      data.map((t) =>
        this.prisma.translation.upsert({
          where: { languageId_namespace_key: { languageId: lang.id, namespace: t.namespace, key: t.key } },
          create: { languageId: lang.id, namespace: t.namespace, key: t.key, value: t.value },
          update: { value: t.value },
        }),
      ),
    );
    await this.redis.del(`translations:${languageCode}:*`);
    return { imported: data.length };
  }

  private async invalidateCache() {
    await this.redis.del('languages:active');
  }
}

// ── Public Languages Controller ───────────────────────────────
// src/common/languages/languages.controller.ts
import { Controller, Get, Param } from '@nestjs/common';

@Controller('languages')
export class LanguagesController {
  constructor(private languages: LanguagesService) {}

  @Get('active')
  getActive() {
    return this.languages.getActive();
  }
}

@Controller('translations')
export class TranslationsController {
  constructor(private languages: LanguagesService) {}

  @Get(':code')
  getTranslations(@Param('code') code: string) {
    return this.languages.getTranslations(code);
  }

  @Get(':code/:namespace')
  getNamespace(@Param('code') code: string, @Param('namespace') ns: string) {
    return this.languages.getTranslations(code, ns);
  }
}

// ── Admin Languages Controller ────────────────────────────────
// src/common/languages/admin-languages.controller.ts
import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('admin/languages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class AdminLanguagesController {
  constructor(private languages: LanguagesService) {}

  @Get()
  getAll() {
    return this.languages.getAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.languages.create(body);
  }

  @Put(':code')
  update(@Param('code') code: string, @Body() body: any) {
    return this.languages.update(code, body);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.OK)
  delete(@Param('code') code: string) {
    return this.languages.delete(code);
  }

  /** GET /admin/languages/:code/translations */
  @Get(':code/translations')
  getTranslations(@Param('code') code: string) {
    return this.languages.getTranslations(code);
  }

  /** PUT /admin/languages/:code/translations/:namespace/:key */
  @Put(':code/translations/:namespace/:key')
  upsertTranslation(
    @Param('code') code: string,
    @Param('namespace') namespace: string,
    @Param('key') key: string,
    @Body() body: { value: string },
  ) {
    return this.languages.upsertTranslation(code, namespace, key, body.value);
  }

  /** POST /admin/languages/:code/translations/import */
  @Post(':code/translations/import')
  importTranslations(
    @Param('code') code: string,
    @Body() body: Array<{ namespace: string; key: string; value: string }>,
  ) {
    return this.languages.upsertTranslationsBulk(code, body);
  }
}
