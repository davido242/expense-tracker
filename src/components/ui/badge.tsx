import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'neutral'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-emerald-100 text-emerald-700': variant === 'default' || variant === 'success',
          'bg-red-100 text-red-700': variant === 'danger',
          'bg-amber-100 text-amber-700': variant === 'warning',
          'bg-slate-100 text-slate-600': variant === 'neutral',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}
