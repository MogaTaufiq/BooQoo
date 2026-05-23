import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Daftar - BooQoo',
  description: 'Buat akun BooQoo baru',
};

export default function RegisterPage() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">BooQoo</h1>
        <p className="text-gray-600">Buat akun baru</p>
      </div>

      <RegisterForm />
    </div>
  );
}
