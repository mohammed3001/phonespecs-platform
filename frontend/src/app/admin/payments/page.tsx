'use client';
import { useState, useEffect } from 'react';
import { CreditCard, Eye, EyeOff, Save, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Gateway {
  id: string;
  provider: string;
  name: string;
  isEnabled: boolean;
  environment: string;
  config: Record<string, string>;
  webhookUrl: string;
}

const GATEWAY_FIELDS: Record<string, { label: string; fields: Array<{ key: string; label: string; secret?: boolean; placeholder?: string }> }> = {
  zaincash: {
    label: 'ZainCash',
    fields: [
      { key: 'merchantId', label: 'Merchant ID', placeholder: 'Your ZainCash Merchant ID' },
      { key: 'msisdn', label: 'MSISDN (Phone)', placeholder: '07xxxxxxxxx' },
      { key: 'secret', label: 'Secret Key', secret: true },
      { key: 'apiBaseUrl', label: 'API Base URL', placeholder: 'https://test.zaincash.iq (sandbox) or https://api.zaincash.iq (production)' },
      { key: 'createPaymentPath', label: 'Create Payment Path', placeholder: '/api/create' },
      { key: 'payPath', label: 'Pay Path', placeholder: '/api/pay' },
      { key: 'redirectUrl', label: 'Redirect URL after payment', placeholder: 'https://yoursite.com/payment/complete' },
    ],
  },
  qicard: {
    label: 'QiCard',
    fields: [
      { key: 'accessKey', label: 'Access Key', secret: true },
      { key: 'profileId', label: 'Profile ID' },
      { key: 'secretKey', label: 'Secret Key', secret: true },
      { key: 'apiBaseUrl', label: 'API Base URL', placeholder: 'https://testsecureacceptance.qi.iq (sandbox)' },
      { key: 'payPath', label: 'Pay Path', placeholder: '/pay' },
    ],
  },
  fib: {
    label: 'FIB (First Iraqi Bank)',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', secret: true },
      { key: 'webhookSecret', label: 'Webhook Secret', secret: true },
      { key: 'apiBaseUrl', label: 'API Base URL', placeholder: 'https://fib.iq/api/sandbox (sandbox)' },
      { key: 'tokenPath', label: 'Token Path', placeholder: '/auth/token' },
      { key: 'createPaymentPath', label: 'Create Payment Path', placeholder: '/v1/payments' },
    ],
  },
};

export default function PaymentsPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'gateways' | 'transactions'>('gateways');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);

  useEffect(() => { loadGateways(); }, []);

  async function loadGateways() {
    const data = await api.admin.payments.getGateways();
    setGateways(data);
    if (data.length > 0 && !selectedGateway) setSelectedGateway(data[0].provider);
  }

  useEffect(() => {
    if (selectedGateway) {
      const gw = gateways.find((g) => g.provider === selectedGateway);
      if (gw) {
        setFormData({
          isEnabled: gw.isEnabled,
          environment: gw.environment,
          webhookUrl: gw.webhookUrl || '',
          config: { ...gw.config },
        });
      }
    }
  }, [selectedGateway, gateways]);

  async function loadTransactions(page = 1) {
    const data = await api.admin.payments.getTransactions({ page });
    setTransactions(data.transactions);
    setTxTotal(data.pagination.total);
    setTxPage(page);
  }

  async function save() {
    if (!selectedGateway) return;
    setSaving(true);
    try {
      await api.admin.payments.updateGateway(selectedGateway, formData);
      await loadGateways();
      toast.success('Gateway saved');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  }

  async function toggle(provider: string, enabled: boolean) {
    try {
      await api.admin.payments.updateGateway(provider, { isEnabled: enabled });
      await loadGateways();
      toast.success(`${provider} ${enabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to toggle gateway'); }
  }

  const selected = gateways.find((g) => g.provider === selectedGateway);
  const fieldDefs = selectedGateway ? GATEWAY_FIELDS[selectedGateway] : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Gateways</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setTab('gateways'); }}
            className={`btn-${tab === 'gateways' ? 'primary' : 'secondary'}`}
          >
            <CreditCard size={16} /> Gateways
          </button>
          <button
            onClick={() => { setTab('transactions'); loadTransactions(); }}
            className={`btn-${tab === 'transactions' ? 'primary' : 'secondary'}`}
          >
            Transactions
          </button>
        </div>
      </div>

      {tab === 'gateways' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gateway list */}
          <div className="space-y-3">
            {gateways.map((gw) => (
              <div
                key={gw.provider}
                onClick={() => setSelectedGateway(gw.provider)}
                className={`admin-card cursor-pointer transition-all ${
                  selectedGateway === gw.provider
                    ? 'border-brand-500 dark:border-brand-400 ring-1 ring-brand-500'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{GATEWAY_FIELDS[gw.provider]?.label || gw.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {gw.isEnabled ? '🟢 Active' : '⚫ Inactive'} · {gw.environment}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggle(gw.provider, !gw.isEnabled); }}
                    className={gw.isEnabled ? 'text-green-600' : 'text-gray-400'}
                  >
                    {gw.isEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Gateway config form */}
          {selected && fieldDefs && (
            <div className="lg:col-span-2 admin-card">
              <h2 className="font-semibold mb-4">{fieldDefs.label} Configuration</h2>

              <div className="space-y-4">
                {/* Enable/disable */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Gateway Status</div>
                    <div className="text-xs text-gray-500">Enable to accept payments via this gateway</div>
                  </div>
                  <button
                    onClick={() => setFormData((prev: any) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                    className={formData.isEnabled ? 'text-green-600' : 'text-gray-400'}
                  >
                    {formData.isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>

                {/* Environment */}
                <div>
                  <label className="form-label">Environment</label>
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, environment: e.target.value }))}
                    className="admin-input"
                  >
                    <option value="sandbox">🧪 Sandbox (Testing)</option>
                    <option value="production">🚀 Production (Live)</option>
                  </select>
                  {formData.environment === 'production' && (
                    <p className="form-hint text-amber-600 dark:text-amber-400">
                      ⚠️ Production mode — real money will be charged
                    </p>
                  )}
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="form-label">Webhook URL</label>
                  <input
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, webhookUrl: e.target.value }))}
                    className="admin-input font-mono text-xs"
                    placeholder={`${process.env.NEXT_PUBLIC_API_URL || 'https://api.yoursite.com'}/api/v1/payments/${selected.provider}/callback`}
                  />
                  <p className="form-hint">Set this URL in your payment gateway webhook settings</p>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Dynamic config fields */}
                {fieldDefs.fields.map((field) => (
                  <div key={field.key}>
                    <label className="form-label">{field.label}</label>
                    <div className="relative">
                      <input
                        type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                        value={formData.config?.[field.key] || ''}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            config: { ...prev.config, [field.key]: e.target.value },
                          }))
                        }
                        className="admin-input"
                        placeholder={field.placeholder || (field.secret ? '••••••••' : '')}
                      />
                      {field.secret && (
                        <button
                          type="button"
                          onClick={() => setShowSecrets((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                    {field.secret && (
                      <p className="form-hint">🔒 Encrypted before storing in database</p>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <button onClick={save} disabled={saving} className="btn-primary">
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'transactions' && (
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Transaction Log</h2>
            <button onClick={() => loadTransactions(txPage)} className="btn-secondary text-xs">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Gateway</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>External ID</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="font-mono text-xs">{tx.id.slice(0, 8)}...</td>
                    <td>{tx.gateway?.name}</td>
                    <td className="font-medium">{tx.amount} {tx.currency}</td>
                    <td>
                      <span className={`badge ${
                        tx.status === 'COMPLETED' ? 'badge-success' :
                        tx.status === 'FAILED' ? 'badge-error' :
                        tx.status === 'PENDING' ? 'badge-warning' : 'badge-gray'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="font-mono text-xs">{tx.externalId || '—'}</td>
                    <td className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {txTotal > 20 && (
            <div className="flex justify-center gap-2 mt-4">
              <button disabled={txPage === 1} onClick={() => loadTransactions(txPage - 1)} className="btn-secondary text-xs">Previous</button>
              <span className="text-sm text-gray-500 self-center">Page {txPage}</span>
              <button disabled={txPage * 20 >= txTotal} onClick={() => loadTransactions(txPage + 1)} className="btn-secondary text-xs">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
