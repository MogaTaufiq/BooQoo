import LandingPage from '@/components/landing/LandingPage';

export const metadata = {
  title: 'BooQoo - Aplikasi Kasir & Stok Gratis untuk UMKM Indonesia',
  description:
    'Aplikasi kasir dan manajemen stok gratis untuk UMKM Indonesia. Offline-First, catat transaksi, pantau stok, lihat laporan — cukup dari HP.',
  openGraph: {
    title: 'BooQoo - Kasir & Stok Gratis untuk UMKM',
    description:
      'Aplikasi kasir dan manajemen stok gratis untuk UMKM Indonesia. Offline-First, mudah digunakan.',
    type: 'website',
  },
};

export default function Home() {
  return <LandingPage />;
}
