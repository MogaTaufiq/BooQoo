'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import classnames from 'classnames'

const faqs = [
  {
    q: 'Apakah BooQoo benar-benar gratis?',
    a: 'Ya, BooQoo gratis selamanya untuk paket dasar. Tidak ada batas waktu, tidak perlu kartu kredit. Paket Pro hanya untuk bisnis yang membutuhkan fitur tambahan seperti multi-outlet dan unlimited transaksi.',
  },
  {
    q: 'Bisa dipakai tanpa internet?',
    a: 'Tentu! BooQoo dirancang dengan arsitektur Offline-First. Anda tetap bisa mencatat transaksi, mengelola stok, dan melihat data walau tanpa koneksi internet. Data akan sinkron otomatis saat online.',
  },
  {
    q: 'Cocok untuk usaha apa saja?',
    a: 'BooQoo cocok untuk berbagai jenis usaha: toko kelontong, kafe, restoran kecil, bakery, fashion, warung sembako, dan usaha rumahan lainnya. Apapun yang perlu dicatat penjualan dan stoknya, BooQoo bisa membantu.',
  },
  {
    q: 'Apakah data saya aman?',
    a: 'Data Anda tersimpan aman di perangkat dan cloud. Kami menggunakan enkripsi standar industri. Karena arsitektur Offline-First, data Anda tetap aman meskipun tidak ada koneksi internet.',
  },
  {
    q: 'Bisa untuk multi-outlet atau punya karyawan?',
    a: 'Di paket Gratis, Anda dapat mengelola 1 outlet. Untuk multi-outlet dan manajemen karyawan, Anda bisa upgrade ke paket Pro yang akan segera diluncurkan.',
  },
  {
    q: 'Bagaimana cara memulainya?',
    a: 'Cukup daftar akun di booqoo.app, lengkapi data toko, dan langsung bisa digunakan. Prosesnya tidak sampai 5 menit. Tersedia juga panduan lengkap untuk membantu Anda.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Pertanyaan yang{' '}
            <span className="text-primary">sering diajukan</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Masih ragu? Temukan jawabannya di sini.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={classnames(
                  'rounded-xl border transition-all duration-200',
                  isOpen
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                >
                  <span className="font-medium text-gray-900 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={classnames(
                      'w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
