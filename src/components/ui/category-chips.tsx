import { cn } from '@/lib/utils'

interface CategoryChipsProps {
  options: { value: string; label: string }[]
  selected: string
  onChange: (value: string) => void
  color?: 'emerald' | 'red'
}

export function CategoryChips({
  options,
  selected,
  onChange,
  color = 'emerald',
}: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-none px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
            selected === opt.value
              ? color === 'emerald'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-red-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
