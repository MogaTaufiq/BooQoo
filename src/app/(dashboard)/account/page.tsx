'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Input, Card, Alert } from '@/components/ui';

type Tab = 'profile' | 'security' | 'danger';

export default function AccountPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName((session.user as any).name || '');
      setEmail((session.user as any).email || '');
      setPhone((session.user as any).phone || '');
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await update();
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Gagal memperbarui profil' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok' });
      return;
    }
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await res.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Gagal mengubah password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const result = await res.json();

      if (result.success) {
        window.location.href = '/login';
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Gagal menghapus akun' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profil' },
    { key: 'security', label: 'Keamanan' },
    { key: 'danger', label: 'Hapus Akun' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Akun Saya</h2>

      {message && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'profile' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil Saya</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Nama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Nomor Telepon"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812xxxxxxxx"
            />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubah Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Password Saat Ini"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="Password Baru"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              helperText="Minimal 6 karakter"
            />
            <Input
              label="Konfirmasi Password Baru"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <Button type="submit" isLoading={isLoading}>
                Ubah Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'danger' && (
        <Card className="p-6 max-w-2xl border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Zona Berbahaya</h3>
          <p className="text-sm text-gray-600 mb-4">
            Menghapus akun akan menghapus seluruh data toko Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
          </p>

          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Hapus Akun Saya
            </Button>
          ) : (
            <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-700">
                Ketik password Anda untuk konfirmasi penghapusan akun.
              </p>
              <Input
                label="Password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Masukkan password"
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  isLoading={isLoading}
                  disabled={!deletePassword}
                >
                  Ya, Hapus Akun
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
