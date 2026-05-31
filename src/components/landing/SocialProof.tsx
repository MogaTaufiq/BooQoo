'use client'

import { motion } from 'framer-motion'
import { Store, ShoppingCart, MapPin, Award } from 'lucide-react'

const stats = [
  {
    icon: Store,
    value: '10rb+',
    label: 'UMKM Bergabung',
  },
  {
    icon: ShoppingCart,
    value: '1jt+',
    label: 'Transaksi Diproses',
  },
  {
    icon: MapPin,
    value: '500+',
    label: 'Kota di Indonesia',
  },
  {
    icon: Award,
    value: '100%',
    label: 'Gratis Selamanya',
  },
]

export default function SocialProof() {
  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-gray-600 text-lg">
            Bergabung dengan ribuan pemilik toko, kafe, dan usaha rumahan di seluruh Indonesia.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
