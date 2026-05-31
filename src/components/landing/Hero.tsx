'use client'

import { motion } from 'framer-motion'
import { ArrowRight, WifiOff, Package, ShoppingCart, BarChart3, MonitorSmartphone } from 'lucide-react'
import Button from './Button'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-b from-orange-50/60 via-white to-white overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <WifiOff className="w-4 h-4" />
              <span>Offline-First untuk UMKM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Aplikasi Kasir & Stok{' '}
              <span className="text-primary">Gratis</span>
              {' '}untuk UMKM Indonesia
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
              Catat transaksi, pantau stok, dan lihat laporan bisnis — cukup dari HP. 
              Tetap berjalan walau tanpa internet. Gratis selamanya.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button href="/register" variant="primary" size="lg">
                Daftar Gratis
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button href="/login" variant="secondary" size="lg">
                Masuk
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Gratis selamanya</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Offline-First</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span>Multi-perangkat</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-2xl opacity-60" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono">booqoo.app/dashboard</span>
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Dashboard Penjualan</h3>
                      <p className="text-xs text-gray-500">Hari ini — 12 Mar 2026</p>
                    </div>
                    <MonitorSmartphone className="w-5 h-5 text-primary" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-orange-50 rounded-xl p-4">
                      <ShoppingCart className="w-5 h-5 text-primary mb-2" />
                      <div className="text-2xl font-bold text-gray-900">47</div>
                      <div className="text-xs text-gray-500">Transaksi</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <Package className="w-5 h-5 text-accent mb-2" />
                      <div className="text-2xl font-bold text-gray-900">1.234</div>
                      <div className="text-xs text-gray-500">Produk</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <BarChart3 className="w-5 h-5 text-blue-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-900">Rp2,4jt</div>
                      <div className="text-xs text-gray-500">Penjualan</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">Grafik Penjualan (7 hari)</span>
                      <span className="text-xs text-accent font-medium">+12%</span>
                    </div>
                    <div className="h-12 flex items-end gap-1.5">
                      {[35, 55, 40, 70, 60, 85, 65].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t-sm"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
