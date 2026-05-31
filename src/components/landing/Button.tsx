'use client'

import Link from 'next/link'
import classnames from 'classnames'

interface ButtonProps {
  children: React.ReactNode
  href: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/20 hover:shadow-primary/30',
  secondary:
    'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200',
  outline:
    'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
}: ButtonProps) {
  const classes = classnames(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer',
    variants[variant],
    sizes[size],
    className,
  )

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
