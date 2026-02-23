// src/app/admin/settings/page.tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, Shield, Globe, Palette, Database, Server } from 'lucide-react';
import { AdminCard } from '@/components/admin/AdminCard';
import { FormField } from '@/components/admin/FormField';
import { Switch } from '@/components/admin/Switch';
import { useSettings } from '@/hooks/useSettings';
import toast from 'react-hot-toast';

const generalSchema = z.object({
  siteName: z.string().min(1),
  siteUrl: z.string().url(),
  siteDescription: z.string(),
  adminLoginPath: z.string().min(5).regex(/^\//, 'Must start with /'),
  defaultLocale: z.string(),
  defaultTheme: z.enum(['light', 'dark', 'system']),
});

const SETTING_TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'auth', label: 'Authentication', icon: Shield },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'performance', label: 'Performance', icon: Server },
  { id: 'seo', label: 'SEO Defaults', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, updateSettings, isLoading } = useSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        System Settings
      </h1>
      <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg mb-6">
        ⚡ All settings take effect immediately — no restart or redeploy required.
      </p>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <nav className="w-48 flex-shrink-0 space-y-1">
          {SETTING_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <GeneralSettings settings={settings} onSave={updateSettings} />
          )}
          {activeTab === 'appearance' && (
            <AppearanceSettings settings={settings} onSave={updateSettings} />
          )}
          {activeTab === 'auth' && (
            <AuthSettings settings={settings} onSave={updateSettings} />
          )}
          {activeTab === 'storage' && (
            <StorageSettings settings={settings} onSave={updateSettings} />
          )}
          {activeTab === 'performance' && (
            <PerformanceSettings settings={settings} onSave={updateSettings} />
          )}
          {activeTab === 'seo' && (
            <SeoDefaultSettings settings={settings} onSave={updateSettings} />
          )}
        </div>
      </div>
    </div>
  );
}

function GeneralSettings({ settings, onSave }: any) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(generalSchema),
    defaultValues: settings,
  });

  const onSubmit = async (data: any) => {
    try {
      await onSave(data);
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminCard title="General Settings">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Site Name" error={errors.siteName?.message}>
          <input {...register('siteName')} className="admin-input" placeholder="My PhoneSpec Site" />
        </FormField>
        <FormField label="Site URL" error={errors.siteUrl?.message}>
          <input {...register('siteUrl')} className="admin-input" placeholder="https://example.com" />
        </FormField>
        <FormField label="Site Description" error={errors.siteDescription?.message}>
          <textarea {...register('siteDescription')} className="admin-input" rows={3} />
        </FormField>
        <FormField
          label="Admin Login Path"
          error={errors.adminLoginPath?.message}
          hint="Change this for security. e.g. /my-secret-admin-login"
        >
          <input {...register('adminLoginPath')} className="admin-input" placeholder="/admin-login" />
        </FormField>
        <FormField label="Default Language" error={errors.defaultLocale?.message}>
          <select {...register('defaultLocale')} className="admin-input">
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </FormField>
        <FormField label="Default Theme">
          <select {...register('defaultTheme')} className="admin-input">
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </FormField>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty}
            className="btn-primary"
          >
            Save Changes
          </button>
        </div>
      </form>
    </AdminCard>
  );
}

function AuthSettings({ settings, onSave }: any) {
  return (
    <AdminCard title="Authentication Settings">
      <div className="space-y-5">
        <Switch
          label="Enable Public Registration"
          description="Allow users to create accounts"
          checked={settings?.registrationEnabled}
          onChange={(v) => onSave({ registrationEnabled: v })}
        />
        <Switch
          label="Enable Login"
          description="If disabled, no one can log in"
          checked={settings?.loginEnabled}
          onChange={(v) => onSave({ loginEnabled: v })}
        />
        <FormField label="Max Login Attempts">
          <input
            type="number"
            defaultValue={settings?.maxLoginAttempts || 5}
            className="admin-input"
            min={3}
            max={20}
            onBlur={(e) => onSave({ maxLoginAttempts: parseInt(e.target.value) })}
          />
        </FormField>
        <FormField label="Lockout Duration (minutes)">
          <input
            type="number"
            defaultValue={settings?.lockoutMinutes || 15}
            className="admin-input"
            min={5}
            onBlur={(e) => onSave({ lockoutMinutes: parseInt(e.target.value) })}
          />
        </FormField>
      </div>
    </AdminCard>
  );
}

function StorageSettings({ settings, onSave }: any) {
  return (
    <AdminCard title="Supabase Storage">
      <div className="space-y-5">
        <FormField label="Supabase URL">
          <input
            type="text"
            defaultValue={settings?.supabaseUrl}
            className="admin-input"
            placeholder="https://xxx.supabase.co"
            onBlur={(e) => onSave({ supabaseUrl: e.target.value })}
          />
        </FormField>
        <FormField label="Anon Key">
          <input
            type="password"
            defaultValue={settings?.supabaseAnonKey}
            className="admin-input"
            onBlur={(e) => onSave({ supabaseAnonKey: e.target.value })}
          />
        </FormField>
        <FormField label="Images Bucket Name">
          <input
            type="text"
            defaultValue={settings?.imageBucket || 'phone-images'}
            className="admin-input"
            onBlur={(e) => onSave({ imageBucket: e.target.value })}
          />
        </FormField>
        <FormField label="Videos Bucket Name">
          <input
            type="text"
            defaultValue={settings?.videoBucket || 'phone-videos'}
            className="admin-input"
            onBlur={(e) => onSave({ videoBucket: e.target.value })}
          />
        </FormField>
      </div>
    </AdminCard>
  );
}

function PerformanceSettings({ settings, onSave }: any) {
  return (
    <AdminCard title="Performance & Caching">
      <div className="space-y-5">
        <Switch
          label="Enable Redis Cache"
          checked={settings?.redisEnabled}
          onChange={(v) => onSave({ redisEnabled: v })}
        />
        <Switch
          label="Enable Cloudflare CDN"
          checked={settings?.cfCdnEnabled}
          onChange={(v) => onSave({ cfCdnEnabled: v })}
        />
        <FormField label="Cache TTL (seconds)">
          <input
            type="number"
            defaultValue={settings?.cacheTtl || 3600}
            className="admin-input"
            onBlur={(e) => onSave({ cacheTtl: parseInt(e.target.value) })}
          />
        </FormField>
      </div>
    </AdminCard>
  );
}

function AppearanceSettings({ settings, onSave }: any) {
  return (
    <AdminCard title="Appearance">
      <div className="space-y-5">
        <FormField label="Logo URL">
          <input
            type="url"
            defaultValue={settings?.logoUrl}
            className="admin-input"
            onBlur={(e) => onSave({ logoUrl: e.target.value })}
          />
        </FormField>
        <FormField label="Favicon URL">
          <input
            type="url"
            defaultValue={settings?.faviconUrl}
            className="admin-input"
            onBlur={(e) => onSave({ faviconUrl: e.target.value })}
          />
        </FormField>
        <FormField label="Icon Library">
          <select
            defaultValue={settings?.iconLibrary || 'lucide'}
            className="admin-input"
            onChange={(e) => onSave({ iconLibrary: e.target.value })}
          >
            <option value="lucide">Lucide React</option>
            <option value="heroicons">Heroicons</option>
          </select>
        </FormField>
        <Switch
          label="Dark Mode Default"
          checked={settings?.defaultTheme === 'dark'}
          onChange={(v) => onSave({ defaultTheme: v ? 'dark' : 'light' })}
        />
      </div>
    </AdminCard>
  );
}

function SeoDefaultSettings({ settings, onSave }: any) {
  return (
    <AdminCard title="SEO Defaults">
      <div className="space-y-5">
        <FormField label="Default Meta Title Template">
          <input
            type="text"
            defaultValue={settings?.seoTitleTemplate || '%s | PhoneSpec'}
            className="admin-input"
            placeholder="%s | My Site Name"
            onBlur={(e) => onSave({ seoTitleTemplate: e.target.value })}
          />
        </FormField>
        <FormField label="Default Meta Description">
          <textarea
            defaultValue={settings?.seoDefaultDescription}
            className="admin-input"
            rows={3}
            onBlur={(e) => onSave({ seoDefaultDescription: e.target.value })}
          />
        </FormField>
        <FormField label="Custom Robots.txt Rules">
          <textarea
            defaultValue={settings?.robotsCustomRules}
            className="admin-input font-mono text-xs"
            rows={5}
            placeholder="# Additional rules..."
            onBlur={(e) => onSave({ robotsCustomRules: e.target.value })}
          />
        </FormField>
      </div>
    </AdminCard>
  );
}
