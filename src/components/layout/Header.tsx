'use client';

// ============================================
// Header Component
// ============================================

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Kasir', href: '/checkout' },
    { name: 'Produk', href: '/products' },
    { name: 'Stok', href: '/inventory' },
    { name: 'Transaksi', href: '/transactions' },
    { name: 'Laporan', href: '/reports' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <Link href="/dashboard" className="text-2xl font-bold text-primary">
              BooQoo
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {session?.user && (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.user.storeName}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Keluar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
