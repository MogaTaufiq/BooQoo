'use client'

import { motion } from 'framer-motion'
import { Check, X, ArrowRight } from 'lucide-react'
import Button from './Button'

const tiers = [
  {
    name: 'Gratis',
    subtitle: 'Untuk memulai',
    price: 'Rp 0',
    period: 'selamanya',
    highlight: false,
    features: [
      { included: true, text: '500 transaksi/bulan' },
      { included: true, text: '1 outlet/toko' },
      { included: true, text: 'Manajemen stok' },
      { included: true, text: 'Laporan dasar' },
      { included: true, text: 'Offline mode' },
      { included: false, text: 'Multi-outlet' },
      { included: false, text: 'Karyawan & user' },
      { included: false, text: 'Laporan lanjutan' },
    ],
    cta: 'Daftar Gratis',
    href: '/register',
    variant: 'outline' as const,
  },
  {
    name: 'Pro',
    subtitle: 'Untuk bisnis berkembang',
    price: 'Rp 99rb',
    period: '/bulan',
    highlight: true,
    features: [
      { included: true, text: 'Unlimited transaksi' },
      { included: true, text: 'Multi-outlet' },
      { included: true, text: 'Manajemen stok' },
      { included: true, text: 'Laporan lengkap + grafik' },
      { included: true, text: 'Offline mode' },
      { included: true, text: 'Multi-outlet' },
      { included: true, text: 'Karyawan & user' },
      { included: true, text: 'Integrasi marketplace' },
    ],
    cta: 'Hubungi Kami',
    href: '#contact',
    variant: 'primary' as const,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Harga yang{' '}
            <span className="text-primary">ramah UMKM</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Mulai gratis. Upgrade kapan saja saat bisnis Anda berkembang.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`rounded-2xl p-8 border-2 transition-all duration-200 ${
                tier.highlight
                  ? 'bg-white border-primary shadow-xl shadow-primary/10 relative'
                  : 'bg-white border-gray-200'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                  Populer
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{tier.subtitle}</p>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  <span className="text-gray-500 text-sm">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                href={tier.href}
                variant={tier.variant}
                className="w-full justify-center"
                size="lg"
              >
                {tier.cta}
                {tier.highlight && <ArrowRight className="w-5 h-5" />}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
