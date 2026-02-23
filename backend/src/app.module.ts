import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PhonesModule } from './phones/phones.module';
import { BrandsModule } from './brands/brands.module';
import { SeoModule } from './seo/seo.module';
import { PaymentsModule } from './payments/payments.module';
import { CloudflareModule } from './cloudflare/cloudflare.module';
import { StorageModule } from './storage/storage.module';
import { LanguagesModule } from './common/languages/languages.module';
import { SettingsModule } from './admin/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60),
          limit: config.get('THROTTLE_LIMIT', 100),
        },
      ],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    AdminModule,
    PhonesModule,
    BrandsModule,
    SeoModule,
    PaymentsModule,
    CloudflareModule,
    StorageModule,
    LanguagesModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
