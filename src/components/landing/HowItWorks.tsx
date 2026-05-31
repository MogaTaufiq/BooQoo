'use client'

import { motion } from 'framer-motion'
import { UserPlus, PackageSearch, ShoppingBag } from 'lucide-react'
import Button from './Button'

const steps = [
  {
    number: '1',
    icon: UserPlus,
    title: 'Daftar Gratis',
    description:
      'Buat akun dalam 1 menit. Tanpa kartu kredit, tanpa komitmen. Langsung bisa digunakan.',
  },
  {
    number: '2',
    icon: PackageSearch,
    title: 'Atur Produk & Stok',
    description:
      'Tambah produk, atur varian, dan atur harga jual. Import dari spreadsheet jika sudah punya data.',
  },
  {
    number: '3',
    icon: ShoppingBag,
    title: 'Mulai Jualan',
    description:
      'Buka kasir, scan produk, dan proses pembayaran. Pantau penjualan dan stok secara real-time.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Mulai dalam{' '}
            <span className="text-primary">3 langkah mudah</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Tidak perlu pelatihan atau technical skill. Langsung pakai.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5, ease: 'easeOut' }}
                className="relative text-center"
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>

                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-6 w-12 h-0.5 bg-gray-200" />
                )}
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Button href="/register" variant="primary" size="lg">
            Daftar Gratis — 1 Menit
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
