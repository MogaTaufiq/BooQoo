'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { Alert } from '@/components/ui';

function LoginError() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const getErrorMessage = (error: string | null) => {
    if (!error || error === 'undefined') return null;

    switch (error) {
      case 'CredentialsSignin':
        return 'Email atau password salah';
      case 'AccessDenied':
        return 'Akses ditolak';
      case 'Configuration':
        return 'Terjadi kesalahan konfigurasi';
      default:
        return 'Terjadi kesalahan saat login';
    }
  };

  const errorMessage = getErrorMessage(error);

  return errorMessage ? (
    <Alert type="error" message={errorMessage} />
  ) : null;
}

export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BooQoo</h1>
        <p className="text-gray-600">Masuk ke akun Anda</p>
      </div>

      <Suspense fallback={null}>
        <LoginError />
      </Suspense>

      <LoginForm />
    </div>
  );
}
