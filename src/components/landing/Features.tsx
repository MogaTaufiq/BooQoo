'use client'

import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Package,
  BarChart3,
  WifiOff,
  Combine,
  Users,
} from 'lucide-react'

const features = [
  {
    icon: ShoppingCart,
    title: 'Kasir Cepat & Mudah',
    description:
      'Scan barcode, pilih produk, proses pembayaran — selesai dalam hitungan detik. Support cash, QRIS, dan transfer.',
    color: 'text-primary',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Package,
    title: 'Manajemen Stok Real-Time',
    description:
      'Pantau stok secara langsung. Dapat notifikasi otomatis saat stok menipis. Kelola ribuan produk tanpa ribet.',
    color: 'text-accent',
    bgColor: 'bg-green-50',
  },
  {
    icon: BarChart3,
    title: 'Laporan Otomatis',
    description:
      'Lihat laporan penjualan harian, mingguan, dan bulanan. Ketahui produk terlaris dan tren bisnis Anda.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: WifiOff,
    title: 'Offline-First',
    description:
      'Tetap bertransaksi walau tanpa internet. Data aman tersimpan, sinkron otomatis saat online kembali.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Combine,
    title: 'Multi-Varian Produk',
    description:
      'Satu produk dengan banyak varian: ukuran, warna, rasa. Masing-masing dengan SKU dan stok terpisah.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
  },
  {
    icon: Users,
    title: 'Multi-Outlet & Karyawan',
    description:
      'Kelola beberapa toko dalam satu akun. Beri akses karyawan dengan izin yang bisa diatur.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Semua yang Anda butuhkan untuk{' '}
            <span className="text-primary">mengelola toko</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Fitur lengkap yang dirancang khusus untuk kebutuhan UMKM Indonesia.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
