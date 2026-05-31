'use client'

import { useState, useEffect } from 'react'
import classnames from 'classnames'
import Button from './Button'

const navLinks = [
  { label: 'Fitur', href: '#features' },
  { label: 'Harga', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={classnames(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span
              className={classnames(
                'font-bold text-xl transition-colors',
                scrolled ? 'text-gray-900' : 'text-gray-900',
              )}
            >
              BooQoo
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={classnames(
                  'text-sm font-medium transition-colors',
                  scrolled
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-600 hover:text-gray-900',
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button href="/login" variant="ghost" size="sm">
              Masuk
            </Button>
            <Button href="/register" variant="primary" size="sm">
              Daftar Gratis
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
