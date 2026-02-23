-- ============================================================
-- PhoneSpec Platform - Supabase Row Level Security Policies
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
-- IMPORTANT: Backend ALWAYS uses service_role key (bypasses RLS)
-- Frontend ALWAYS uses anon key (subject to RLS)
-- ============================================================

-- ─── Enable RLS on all tables ────────────────────────────────
-- (Prisma migrations create tables; this file enables RLS)

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloudflare_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE compare_items ENABLE ROW LEVEL SECURITY;

-- ─── PUBLIC READ policies (anon key can read these) ───────────

-- Phones: anon can read active phones only
CREATE POLICY "public_read_active_phones"
  ON phones FOR SELECT
  TO anon
  USING (is_active = true);

-- Brands: anon can read active brands
CREATE POLICY "public_read_active_brands"
  ON brands FOR SELECT
  TO anon
  USING (is_active = true);

-- Phone specs: anon can read specs for active phones
CREATE POLICY "public_read_phone_specs"
  ON phone_specs FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM phones WHERE phones.id = phone_specs.phone_id AND phones.is_active = true
    )
  );

-- Phone images: anon can read images for active phones
CREATE POLICY "public_read_phone_images"
  ON phone_images FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM phones WHERE phones.id = phone_images.phone_id AND phones.is_active = true
    )
  );

-- Phone videos: anon can read videos for active phones
CREATE POLICY "public_read_phone_videos"
  ON phone_videos FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM phones WHERE phones.id = phone_videos.phone_id AND phones.is_active = true
    )
  );

-- Reviews: anon can read published reviews
CREATE POLICY "public_read_published_reviews"
  ON reviews FOR SELECT
  TO anon
  USING (is_published = true);

-- Languages: anon can read active languages
CREATE POLICY "public_read_active_languages"
  ON languages FOR SELECT
  TO anon
  USING (is_active = true);

-- Translations: anon can read translations
CREATE POLICY "public_read_translations"
  ON translations FOR SELECT
  TO anon
  USING (true);

-- Spec categories: anon can read active categories
CREATE POLICY "public_read_spec_categories"
  ON spec_categories FOR SELECT
  TO anon
  USING (is_active = true);

-- Spec attributes: anon can read active attributes
CREATE POLICY "public_read_spec_attributes"
  ON spec_attributes FOR SELECT
  TO anon
  USING (is_active = true);

-- SEO meta: anon can read seo meta
CREATE POLICY "public_read_seo_meta"
  ON seo_meta FOR SELECT
  TO anon
  USING (true);

-- Media files: anon can read public files
CREATE POLICY "public_read_media_files"
  ON media_files FOR SELECT
  TO anon
  USING (is_public = true);

-- ─── SYSTEM SETTINGS: only public keys for anon ───────────────
-- (specific safe keys only, no secrets)
CREATE POLICY "public_read_safe_settings"
  ON system_settings FOR SELECT
  TO anon
  USING (
    key IN (
      'site_name', 'site_url', 'site_description', 'logo_url',
      'favicon_url', 'default_locale', 'default_theme', 'icon_library',
      'seo_title_template', 'phones_per_page'
    )
    AND type != 'secret'
  );

-- ─── DENY ALL WRITES for anon ────────────────────────────────
-- (anon cannot INSERT/UPDATE/DELETE anything — backend service_role handles all writes)

-- ─── ADMIN tables: NO anon access ────────────────────────────
-- admin_users, admin_sessions, audit_logs: deny all anon
CREATE POLICY "deny_anon_admin_users"
  ON admin_users FOR ALL
  TO anon
  USING (false);

CREATE POLICY "deny_anon_admin_sessions"
  ON admin_sessions FOR ALL
  TO anon
  USING (false);

CREATE POLICY "deny_anon_audit_logs"
  ON audit_logs FOR ALL
  TO anon
  USING (false);

-- Payment gateways: deny anon
CREATE POLICY "deny_anon_payment_gateways"
  ON payment_gateways FOR ALL
  TO anon
  USING (false);

-- Transactions: deny anon
CREATE POLICY "deny_anon_transactions"
  ON transactions FOR ALL
  TO anon
  USING (false);

-- Cloudflare config: deny anon
CREATE POLICY "deny_anon_cloudflare"
  ON cloudflare_config FOR ALL
  TO anon
  USING (false);

-- Full system_settings for anon (only specific keys allowed above)
CREATE POLICY "deny_anon_sensitive_settings"
  ON system_settings FOR ALL
  TO anon
  USING (
    key NOT IN (
      'site_name', 'site_url', 'site_description', 'logo_url',
      'favicon_url', 'default_locale', 'default_theme', 'icon_library',
      'seo_title_template', 'phones_per_page'
    )
  );

-- ─── Storage Buckets RLS ──────────────────────────────────────
-- Run these in Supabase Dashboard → Storage → Policies

-- phone-images bucket: public read
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'public-read-phone-images',
  'phone-images',
  '{"operation": "SELECT", "role": "anon"}'
);

-- phone-videos bucket: public read
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'public-read-phone-videos',
  'phone-videos',
  '{"operation": "SELECT", "role": "anon"}'
);

-- ─── Verification Query ───────────────────────────────────────
-- Run this to confirm RLS is enabled:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
