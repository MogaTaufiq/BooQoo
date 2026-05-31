'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Button from './Button'

export default function CTASection() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 via-white to-primary/5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ribuan UMKM sudah beralih</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight"
        >
          Digitalisasi bisnis Anda.{' '}
          <span className="text-primary">Gratis. 1 Menit.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Bergabung dengan ribuan UMKM yang sudah beralih ke BooQoo. 
          Gratis selamanya, tanpa kartu kredit.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button href="/register" variant="primary" size="lg">
            Daftar Gratis
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button href="/login" variant="secondary" size="lg">
            Masuk
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
