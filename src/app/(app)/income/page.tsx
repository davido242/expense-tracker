'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingUp } from 'lucide-react'
import { storage } from '@/lib/storage'
import { formatCurrency, formatShortDate, today } from '@/lib/format'
import {
  AppSetup,
  Income,
  IncomeCategory,
  INCOME_CATEGORIES,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { CategoryChips } from '@/components/ui/category-chips'

const INCOME_OPTIONS = (Object.entries(INCOME_CATEGORIES) as [IncomeCategory, string][]).map(
  ([value, label]) => ({ value, label }),
)

export default function IncomePage() {
  const [setup, setSetup] = useState<AppSetup | null>(null)
  const [income, setIncome] = useState<Income[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Form state
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<IncomeCategory>('sales')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())
  const [amountError, setAmountError] = useState('')

  useEffect(() => {
    setSetup(storage.getSetup())
    setIncome(storage.getIncome())
  }, [])

  const currency = setup?.currency || 'NGN'
  const total = income.reduce((s, i) => s + i.amount, 0)

  const resetForm = () => {
    setAmount('')
    setCategory('sales')
    setNote('')
    setDate(today())
    setAmountError('')
  }

  const handleSave = () => {
    const num = parseFloat(amount)
    if (!amount || isNaN(num) || num <= 0) {
      setAmountError('Enter a valid amount')
      return
    }
    const entry: Income = {
      id: crypto.randomUUID(),
      amount: num,
      category,
      note: note.trim() || undefined,
      date,
      createdAt: new Date().toISOString(),
    }
    storage.addIncome(entry)
    setIncome(storage.getIncome())
    setIsOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    storage.deleteIncome(id)
    setIncome(storage.getIncome())
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-xs uppercase tracking-wide font-medium">
              Total Income
            </p>
            <p className="text-white text-3xl font-bold mt-1">
              {formatCurrency(total, currency)}
            </p>
            <p className="text-emerald-200 text-xs mt-1">{income.length} transactions</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <TrendingUp size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Add button */}
      <div className="px-4 py-4">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full"
          size="lg"
        >
          <Plus size={20} /> Add Income
        </Button>
      </div>

      {/* List */}
      <div className="px-4">
        {income.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
            <p className="text-5xl mb-3">💵</p>
            <p className="text-slate-500 font-medium">No income recorded yet</p>
            <p className="text-slate-400 text-sm mt-1">Tap Add Income to record your first sale</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 divide-y divide-slate-50">
            {income.map((item) => (
              <div key={item.id} className="px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-none">
                  <TrendingUp size={15} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {INCOME_CATEGORIES[item.category]}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatShortDate(item.date)}
                    {item.note ? ` · ${item.note}` : ''}
                  </p>
                </div>
                <p className="font-bold text-emerald-600 text-sm flex-none">
                  +{formatCurrency(item.amount, currency)}
                </p>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-none"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Income Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); resetForm() }}
        title="Add Income"
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setAmountError('') }}
            error={amountError}
            inputMode="decimal"
            autoFocus
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <CategoryChips
              options={INCOME_OPTIONS}
              selected={category}
              onChange={(v) => setCategory(v as IncomeCategory)}
              color="emerald"
            />
          </div>

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Textarea
            label="Note (optional)"
            placeholder="e.g. Jollof rice order, online sale…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />

          <Button onClick={handleSave} size="lg" className="w-full mt-2">
            Save Income
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
