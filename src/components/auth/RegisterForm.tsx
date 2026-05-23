'use client';

// ============================================
// Register Form Component
// ============================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema } from '@/lib/validators/schemas';
import { Button, Input, Alert } from '@/components/ui';
import type { z } from 'zod';

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || 'Terjadi kesalahan saat membuat akun');
        return;
      }

      // Registration successful, redirect to login
      router.push('/login?registered=true');
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Input
        label="Nama Lengkap"
        type="text"
        placeholder="John Doe"
        error={errors.name?.message}
        {...register('name')}
        required
      />

      <Input
        label="Email"
        type="email"
        placeholder="contoh@email.com"
        error={errors.email?.message}
        {...register('email')}
        required
      />

      <Input
        label="No. HP (Opsional)"
        type="tel"
        placeholder="08123456789"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <Input
        label="Nama Toko"
        type="text"
        placeholder="Toko Frozen Food Ibu Siti"
        error={errors.storeName?.message}
        helperText="Nama toko Anda yang akan muncul di aplikasi"
        {...register('storeName')}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        helperText="Minimal 6 karakter"
        {...register('password')}
        required
      />

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Memproses...' : 'Daftar'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Masuk di sini
        </Link>
      </div>
    </form>
  );
};
