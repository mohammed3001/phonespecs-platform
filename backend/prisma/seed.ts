// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Super Admin ─────────────────────────────────────────────
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123456!';
  const hash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      username: 'superadmin',
      email: process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ─── Default System Settings ──────────────────────────────────
  const defaultSettings = [
    { key: 'site_name', value: 'PhoneSpec', group: 'general' },
    { key: 'site_url', value: 'https://example.com', group: 'general' },
    { key: 'site_description', value: 'Mobile phone specs & reviews', group: 'general' },
    { key: 'admin_login_path', value: '/admin-login', group: 'security' },
    { key: 'default_locale', value: 'en', group: 'i18n' },
    { key: 'default_theme', value: 'system', group: 'appearance' },
    { key: 'logo_url', value: '', group: 'appearance' },
    { key: 'favicon_url', value: '/favicon.ico', group: 'appearance' },
    { key: 'registration_enabled', value: 'false', group: 'auth', type: 'boolean' },
    { key: 'login_enabled', value: 'true', group: 'auth', type: 'boolean' },
    { key: 'max_login_attempts', value: '5', group: 'auth', type: 'number' },
    { key: 'lockout_minutes', value: '15', group: 'auth', type: 'number' },
    { key: 'redis_enabled', value: 'true', group: 'performance', type: 'boolean' },
    { key: 'cache_ttl', value: '3600', group: 'performance', type: 'number' },
    { key: 'cf_cdn_enabled', value: 'false', group: 'cloudflare', type: 'boolean' },
    { key: 'icon_library', value: 'lucide', group: 'appearance' },
    { key: 'seo_title_template', value: '%s | PhoneSpec', group: 'seo' },
    { key: 'robots_custom_rules', value: '', group: 'seo' },
    { key: 'phones_per_page', value: '24', group: 'general', type: 'number' },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✅ ${defaultSettings.length} system settings`);

  // ─── Languages ────────────────────────────────────────────────
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isDefault: true, isActive: true, sortOrder: 0 },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isDefault: false, isActive: true, sortOrder: 1 },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
  }
  console.log(`✅ ${languages.length} languages`);

  // ─── Spec Categories ──────────────────────────────────────────
  const categories = [
    { slug: 'display', name: 'Display', sortOrder: 1 },
    { slug: 'performance', name: 'Performance', sortOrder: 2 },
    { slug: 'camera', name: 'Camera', sortOrder: 3 },
    { slug: 'battery', name: 'Battery', sortOrder: 4 },
    { slug: 'storage', name: 'Memory', sortOrder: 5 },
    { slug: 'connectivity', name: 'Connectivity', sortOrder: 6 },
    { slug: 'design', name: 'Design', sortOrder: 7 },
    { slug: 'audio', name: 'Audio', sortOrder: 8 },
  ];

  for (const cat of categories) {
    await prisma.specCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // ─── Spec Attributes ──────────────────────────────────────────
  const displayCat = await prisma.specCategory.findUnique({ where: { slug: 'display' } });
  const perfCat = await prisma.specCategory.findUnique({ where: { slug: 'performance' } });
  const camCat = await prisma.specCategory.findUnique({ where: { slug: 'camera' } });
  const batCat = await prisma.specCategory.findUnique({ where: { slug: 'battery' } });
  const storageCat = await prisma.specCategory.findUnique({ where: { slug: 'storage' } });

  const attributes = [
    // Display
    { categoryId: displayCat!.id, slug: 'screen-size', name: 'Screen Size', unit: 'inches', isHighlight: true, sortOrder: 1 },
    { categoryId: displayCat!.id, slug: 'screen-type', name: 'Display Type', isHighlight: true, sortOrder: 2 },
    { categoryId: displayCat!.id, slug: 'resolution', name: 'Resolution', isHighlight: false, sortOrder: 3 },
    { categoryId: displayCat!.id, slug: 'refresh-rate', name: 'Refresh Rate', unit: 'Hz', isHighlight: true, sortOrder: 4 },
    // Performance
    { categoryId: perfCat!.id, slug: 'chipset', name: 'Chipset', isHighlight: true, sortOrder: 1 },
    { categoryId: perfCat!.id, slug: 'cpu', name: 'CPU', sortOrder: 2 },
    { categoryId: perfCat!.id, slug: 'gpu', name: 'GPU', sortOrder: 3 },
    // Camera
    { categoryId: camCat!.id, slug: 'main-camera', name: 'Main Camera', unit: 'MP', isHighlight: true, sortOrder: 1 },
    { categoryId: camCat!.id, slug: 'selfie-camera', name: 'Selfie Camera', unit: 'MP', isHighlight: true, sortOrder: 2 },
    { categoryId: camCat!.id, slug: 'video-recording', name: 'Video Recording', sortOrder: 3 },
    // Battery
    { categoryId: batCat!.id, slug: 'battery-capacity', name: 'Battery', unit: 'mAh', isHighlight: true, sortOrder: 1 },
    { categoryId: batCat!.id, slug: 'charging-speed', name: 'Fast Charging', unit: 'W', isHighlight: true, sortOrder: 2 },
    // Storage
    { categoryId: storageCat!.id, slug: 'ram', name: 'RAM', unit: 'GB', isHighlight: true, sortOrder: 1 },
    { categoryId: storageCat!.id, slug: 'internal-storage', name: 'Storage', unit: 'GB', isHighlight: true, sortOrder: 2 },
  ];

  for (const attr of attributes) {
    await prisma.specAttribute.upsert({
      where: { slug: attr.slug },
      update: {},
      create: { ...attr, type: 'text', isComparable: true, isFilterable: true, isActive: true },
    });
  }
  console.log(`✅ Spec categories and attributes seeded`);

  // ─── Payment Gateways ─────────────────────────────────────────
  const gateways = [
    { provider: 'zaincash', name: 'ZainCash', isEnabled: false, environment: 'sandbox', config: '{}' },
    { provider: 'qicard', name: 'QiCard', isEnabled: false, environment: 'sandbox', config: '{}' },
    { provider: 'fib', name: 'FIB - First Iraqi Bank', isEnabled: false, environment: 'sandbox', config: '{}' },
  ];

  for (const gw of gateways) {
    await prisma.paymentGateway.upsert({
      where: { provider: gw.provider },
      update: {},
      create: gw,
    });
  }
  console.log(`✅ Payment gateways initialized`);

  console.log('\n🎉 Seed complete!');
  console.log(`📧 Admin email: ${admin.email}`);
  console.log(`🔑 Admin password: ${password}`);
  console.log('⚠️  Change your password immediately after first login!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
