'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { phones, brands } from '@/data/mock-phones';
import { articles } from '@/data/mock-articles';

const STATS = [
  { label: 'Total Phones', value: '15', icon: 'mdi:cellphone', color: 'bg-blue-500' },
  { label: 'Total Brands', value: '8', icon: 'mdi:domain', color: 'bg-green-500' },
  { label: 'Featured', value: '3', icon: 'mdi:star', color: 'bg-yellow-500' },
  { label: 'Page Views', value: '24.5K', icon: 'mdi:eye-outline', color: 'bg-purple-500' },
  { label: 'Ad Clicks', value: '1,234', icon: 'mdi:cursor-default-click', color: 'bg-orange-500' },
  { label: 'Companies', value: '5', icon: 'mdi:office-building', color: 'bg-pink-500' },
];

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard' },
  { id: 'phones', label: 'Phones', icon: 'mdi:cellphone' },
  { id: 'brands', label: 'Brands', icon: 'mdi:domain' },
  { id: 'articles', label: 'Articles', icon: 'mdi:newspaper-variant-outline' },
  { id: 'users', label: 'Users', icon: 'mdi:account-group' },
  { id: 'analytics', label: 'Analytics', icon: 'mdi:chart-bar' },
  { id: 'media', label: 'Media Library', icon: 'mdi:image-multiple' },
  { id: 'ads', label: 'Sponsored Ads', icon: 'mdi:advertisements' },
  { id: 'settings', label: 'Settings', icon: 'mdi:cog' },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ' + (sidebarOpen ? 'w-64' : 'w-16')}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Icon icon="mdi:shield-crown" width={20} className="text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-gray-900 dark:text-white">Admin Panel</span>}
          </div>
        </div>
        <nav className="p-2 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' + (activeSection === item.id ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}
            >
              <Icon icon={item.icon} width={20} className="shrink-0" />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <Icon icon="mdi:menu" width={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{activeSection}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 relative">
              <Icon icon="mdi:bell-outline" width={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <Icon icon="mdi:account" width={18} className="text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'phones' && <PhonesSection />}
          {activeSection === 'brands' && <BrandsSection />}
          {activeSection === 'articles' && <ArticlesSection />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'analytics' && <AnalyticsSection />}
          {activeSection === 'media' && <MediaSection />}
          {activeSection === 'ads' && <AdsSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

function DashboardSection() {
  const topPhones = phones.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="card p-5 flex items-center gap-4">
            <div className={'w-12 h-12 rounded-xl flex items-center justify-center ' + stat.color}>
              <Icon icon={stat.icon} width={24} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Phones</h3>
          <div className="space-y-3">
            {topPhones.map((phone, idx) => (
              <div key={phone.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="text-sm font-bold text-gray-400 w-6">{idx + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{phone.name}</p>
                  <p className="text-xs text-gray-500">{phone.brand.name}</p>
                </div>
                <span className="text-sm text-gray-500">{phone.viewCount.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Brands</h3>
          <div className="space-y-3">
            {brands.slice(0, 5).map((brand) => {
              const count = phones.filter(p => p.brandId === brand.id).length;
              return (
                <div key={brand.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Icon icon="mdi:domain" width={20} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{brand.name}</p>
                  </div>
                  <span className="text-sm text-gray-500">{count} phones</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhonesSection() {
  const [search, setSearch] = useState('');
  const filtered = phones.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Icon icon="mdi:magnify" width={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phones..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <button className="btn-primary text-sm">
          <Icon icon="mdi:plus" width={18} />
          Add Phone
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Brand</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Featured</th>
              <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((phone) => (
              <tr key={phone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{phone.name}</p>
                  <p className="text-xs text-gray-500">{phone.slug}</p>
                </td>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{phone.brand.name}</td>
                <td className="p-3 text-sm font-medium text-gray-900 dark:text-white">${phone.priceUsd}</td>
                <td className="p-3">
                  <span className={'inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + (phone.status === 'AVAILABLE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : phone.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
                    {phone.status}
                  </span>
                </td>
                <td className="p-3">
                  <Icon icon={phone.isFeatured ? 'mdi:star' : 'mdi:star-outline'} width={18} className={phone.isFeatured ? 'text-yellow-500' : 'text-gray-300'} />
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-brand-600">
                      <Icon icon="mdi:pencil-outline" width={16} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500">
                      <Icon icon="mdi:delete-outline" width={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BrandsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Brands</h2>
        <button className="btn-primary text-sm">
          <Icon icon="mdi:plus" width={18} />
          Add Brand
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map((brand) => {
          const count = phones.filter(p => p.brandId === brand.id).length;
          return (
            <div key={brand.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Icon icon="mdi:domain" width={24} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{brand.name}</p>
                <p className="text-sm text-gray-500">{count} phones</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                  <Icon icon="mdi:pencil-outline" width={16} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                  <Icon icon="mdi:delete-outline" width={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MediaSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media Library</h2>
        <button className="btn-primary text-sm">
          <Icon icon="mdi:upload" width={18} />
          Upload
        </button>
      </div>
      <div className="card p-12 text-center">
        <Icon icon="mdi:image-multiple-outline" width={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No media uploaded</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Upload images, logos, and videos for your phones and articles.
        </p>
        <p className="text-xs text-gray-400">Supported: WebP, PNG, JPG, SVG, MP4, WebM</p>
      </div>
    </div>
  );
}

function AdsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sponsored Ads</h2>
        <button className="btn-primary text-sm">
          <Icon icon="mdi:plus" width={18} />
          Create Campaign
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
          <p className="text-sm text-gray-500">Active Campaigns</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">12.4K</p>
          <p className="text-sm text-gray-500">Total Impressions</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">1,234</p>
          <p className="text-sm text-gray-500">Total Clicks</p>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Active Campaigns</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Icon icon="mdi:advertisements" width={24} className="text-brand-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Samsung Galaxy S25 Ultra - Search Boost</p>
              <p className="text-xs text-gray-500">Type: Search Result &middot; Budget: $500/mo</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Icon icon="mdi:advertisements" width={24} className="text-brand-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">iPhone 16 Pro Max - Sidebar Banner</p>
              <p className="text-xs text-gray-500">Type: Sidebar &middot; Budget: $300/mo</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticlesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Articles</h2>
        <button className="btn-primary text-sm">
          <Icon icon="mdi:plus" width={18} />
          New Article
        </button>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Author</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{article.title}</p>
                  <p className="text-xs text-gray-500">/{article.slug}</p>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 capitalize">{article.category}</span>
                </td>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{article.author.name}</td>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{article.publishedAt}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Published</span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-brand-600"><Icon icon="mdi:pencil-outline" width={16} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500"><Icon icon="mdi:delete-outline" width={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const MOCK_USERS = [
  { id: 'u1', name: 'Mohammed Al-Saadi', email: 'admin@phonespec.com', role: 'Super Admin', status: 'Active', lastLogin: '2026-04-12' },
  { id: 'u2', name: 'Sarah Johnson', email: 'sarah@phonespec.com', role: 'Editor', status: 'Active', lastLogin: '2026-04-11' },
  { id: 'u3', name: 'Ahmed Hassan', email: 'ahmed@phonespec.com', role: 'Reviewer', status: 'Active', lastLogin: '2026-04-10' },
  { id: 'u4', name: 'Tech Corp Inc.', email: 'brand@techcorp.com', role: 'Brand Manager', status: 'Active', lastLogin: '2026-04-09' },
  { id: 'u5', name: 'Jane Smith', email: 'jane@phonespec.com', role: 'Support', status: 'Inactive', lastLogin: '2026-03-20' },
];

function UsersSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users & Roles</h2>
        <button className="btn-primary text-sm"><Icon icon="mdi:account-plus" width={18} />Add User</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[{ label: 'Total Users', value: '5', icon: 'mdi:account-group', color: 'bg-blue-500' }, { label: 'Admins', value: '1', icon: 'mdi:shield-crown', color: 'bg-purple-500' }, { label: 'Editors', value: '2', icon: 'mdi:pencil', color: 'bg-green-500' }, { label: 'Brand Managers', value: '1', icon: 'mdi:domain', color: 'bg-orange-500' }].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + s.color}><Icon icon={s.icon} width={20} className="text-white" /></div>
            <div><p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
          </div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Last Login</th>
              <th className="text-right p-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center"><Icon icon="mdi:account" width={16} className="text-brand-600" /></div>
                    <div><p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div>
                  </div>
                </td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">{user.role}</span></td>
                <td className="p-3"><span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + (user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>{user.status}</span></td>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">{user.lastLogin}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-brand-600"><Icon icon="mdi:pencil-outline" width={16} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500"><Icon icon="mdi:delete-outline" width={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ANALYTICS_DATA = [
  { month: 'Jan', views: 12400, searches: 8200, clicks: 1100 },
  { month: 'Feb', views: 15600, searches: 9800, clicks: 1350 },
  { month: 'Mar', views: 18200, searches: 11500, clicks: 1600 },
  { month: 'Apr', views: 24500, searches: 14200, clicks: 2100 },
];

const ACTIVITY_LOG = [
  { id: 'a1', action: 'Phone added: Samsung Galaxy A56', user: 'Admin', time: '2 hours ago', icon: 'mdi:cellphone-plus' },
  { id: 'a2', action: 'Article published: Best Budget Phones 2026', user: 'Sarah', time: '4 hours ago', icon: 'mdi:newspaper-variant' },
  { id: 'a3', action: 'Brand updated: OnePlus logo changed', user: 'Admin', time: '6 hours ago', icon: 'mdi:domain' },
  { id: 'a4', action: 'Ad campaign created: Honor Magic 7 Pro Sidebar', user: 'Tech Corp', time: '1 day ago', icon: 'mdi:advertisements' },
  { id: 'a5', action: 'User role changed: Ahmed → Reviewer', user: 'Admin', time: '2 days ago', icon: 'mdi:account-edit' },
];

function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <Icon icon="mdi:eye" width={28} className="mx-auto text-blue-500 mb-2" />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">70.7K</p>
          <p className="text-sm text-gray-500">Total Page Views</p>
          <p className="text-xs text-green-600 mt-1">+34.6% from last month</p>
        </div>
        <div className="card p-5 text-center">
          <Icon icon="mdi:magnify" width={28} className="mx-auto text-purple-500 mb-2" />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">43.7K</p>
          <p className="text-sm text-gray-500">Total Searches</p>
          <p className="text-xs text-green-600 mt-1">+23.5% from last month</p>
        </div>
        <div className="card p-5 text-center">
          <Icon icon="mdi:cursor-default-click" width={28} className="mx-auto text-orange-500 mb-2" />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">6.15K</p>
          <p className="text-sm text-gray-500">Total Ad Clicks</p>
          <p className="text-xs text-green-600 mt-1">+31.3% from last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Traffic</h3>
          <div className="space-y-3">
            {ANALYTICS_DATA.map((d) => (
              <div key={d.month} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-8">{d.month}</span>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(d.views / 25000) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">{(d.views / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {ACTIVITY_LOG.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
                  <Icon icon={log.icon} width={16} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{log.action}</p>
                  <p className="text-xs text-gray-500">{log.user} &middot; {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Searched Terms</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Samsung Galaxy S25', 'iPhone 16 Pro', 'Honor X8d', 'best camera phone', 'budget phones 2026', '5G phones', 'Xiaomi 14', 'OnePlus 13'].map((term) => (
            <div key={term} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 text-center">{term}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name</label>
            <input type="text" defaultValue="PhoneSpecs" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Description</label>
            <textarea rows={3} defaultValue="The ultimate phone specifications search engine" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Meta Title</label>
            <input type="text" defaultValue="PhoneSpecs - Compare Phone Specifications" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Meta Description</label>
            <textarea rows={2} defaultValue="Search and compare phone specifications. Find the best phone for your needs." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
        </div>
      </div>
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cache & Performance</h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Redis Cache</p>
            <p className="text-xs text-gray-500">Connected to localhost:6379</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Connected</span>
        </div>
      </div>
      <button className="btn-primary">Save Settings</button>
    </div>
  );
}
