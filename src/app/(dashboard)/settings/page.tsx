'use client';

// ============================================
// Settings Page
// ============================================

import { useState, useEffect } from 'react';
import { Button, Input, Card, Alert } from '@/components/ui';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    lowStockThreshold: 10,
    expiryAlertDays: 7,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings');
      const result = await response.json();

      if (result.success) {
        const store = result.data;
        const settings = store.settings || {};

        setFormData({
          name: store.name || '',
          description: store.description || '',
          phone: store.phone || '',
          address: store.address || '',
          lowStockThreshold: settings.lowStockThreshold || 10,
          expiryAlertDays: settings.expiryAlertDays || 7,
        });
      } else {
        setError(result.error?.message || 'Gagal mengambil pengaturan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Gagal menyimpan pengaturan');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pengaturan</h2>
        <p className="text-gray-600 mt-1">Kelola informasi toko dan preferensi sistem</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message="Pengaturan berhasil disimpan!" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informasi Toko
          </h3>

          <div className="space-y-4">
            <Input
              label="Nama Toko"
              placeholder="Toko Pempek Palembang"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Deskripsi singkat tentang toko Anda"
              />
            </div>

            <Input
              label="Nomor Telepon"
              type="tel"
              placeholder="08123456789"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="block w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alamat lengkap toko"
              />
            </div>
          </div>
        </Card>

        {/* Inventory Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Pengaturan Inventori
          </h3>

          <div className="space-y-4">
            <Input
              label="Batas Stok Menipis"
              type="number"
              placeholder="10"
              value={formData.lowStockThreshold.toString()}
              onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value) || 0)}
              helperText="Produk dengan stok ≤ nilai ini akan diberi peringatan"
              min="0"
              required
            />

            <Input
              label="Peringatan Kedaluwarsa (Hari)"
              type="number"
              placeholder="7"
              value={formData.expiryAlertDays.toString()}
              onChange={(e) => handleChange('expiryAlertDays', parseInt(e.target.value) || 1)}
              helperText="Produk yang akan kedaluwarsa dalam X hari akan diberi peringatan"
              min="1"
              required
            />
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">
                Informasi Pengaturan
              </h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Pengaturan ini berlaku untuk seluruh sistem</li>
                  <li>Perubahan akan langsung aktif setelah disimpan</li>
                  <li>Peringatan stok menipis muncul di Dashboard dan Inventori</li>
                  <li>Peringatan kedaluwarsa dihitung dari tanggal hari ini</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={fetchSettings}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button type="submit" isLoading={isSaving} disabled={isSaving}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
