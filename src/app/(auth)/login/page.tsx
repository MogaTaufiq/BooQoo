import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Masuk - BooQoo',
  description: 'Masuk ke akun BooQoo Anda',
};

export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BooQoo</h1>
        <p className="text-gray-600">Masuk ke akun Anda</p>
      </div>

      <LoginForm />
    </div>
  );
}
