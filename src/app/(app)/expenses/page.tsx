'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, TrendingDown, Camera, X } from 'lucide-react'
import { storage } from '@/lib/storage'
import { formatCurrency, formatShortDate, today } from '@/lib/format'
import {
  AppSetup,
  Expense,
  ExpenseCategory,
  EXPENSE_CATEGORIES,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { CategoryChips } from '@/components/ui/category-chips'

const EXPENSE_OPTIONS = (Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, string][]).map(
  ([value, label]) => ({ value, label }),
)

export default function ExpensesPage() {
  const [setup, setSetup] = useState<AppSetup | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Form state
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('supplies')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())
  const [receiptPhoto, setReceiptPhoto] = useState<string | undefined>()
  const [amountError, setAmountError] = useState('')

  useEffect(() => {
    setSetup(storage.getSetup())
    setExpenses(storage.getExpenses())
  }, [])

  const currency = setup?.currency || 'NGN'
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const resetForm = () => {
    setAmount('')
    setCategory('supplies')
    setNote('')
    setDate(today())
    setReceiptPhoto(undefined)
    setAmountError('')
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo too large. Please use an image under 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setReceiptPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const num = parseFloat(amount)
    if (!amount || isNaN(num) || num <= 0) {
      setAmountError('Enter a valid amount')
      return
    }
    const entry: Expense = {
      id: crypto.randomUUID(),
      amount: num,
      category,
      note: note.trim() || undefined,
      receiptPhoto,
      date,
      createdAt: new Date().toISOString(),
    }
    storage.addExpense(entry)
    setExpenses(storage.getExpenses())
    setIsOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    storage.deleteExpense(id)
    setExpenses(storage.getExpenses())
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-xs uppercase tracking-wide font-medium">
              Total Expenses
            </p>
            <p className="text-white text-3xl font-bold mt-1">
              {formatCurrency(total, currency)}
            </p>
            <p className="text-red-200 text-xs mt-1">{expenses.length} transactions</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <TrendingDown size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Add button */}
      <div className="px-4 py-4">
        <Button
          onClick={() => setIsOpen(true)}
          variant="destructive"
          className="w-full"
          size="lg"
        >
          <Plus size={20} /> Add Expense
        </Button>
      </div>

      {/* List */}
      <div className="px-4">
        {expenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
            <p className="text-5xl mb-3">🧾</p>
            <p className="text-slate-500 font-medium">No expenses recorded yet</p>
            <p className="text-slate-400 text-sm mt-1">Tap Add Expense to log your first cost</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 divide-y divide-slate-50">
            {expenses.map((item) => (
              <div key={item.id} className="px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-none">
                  {item.receiptPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.receiptPhoto}
                      alt="receipt"
                      className="w-9 h-9 rounded-xl object-cover"
                    />
                  ) : (
                    <TrendingDown size={15} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">
                    {EXPENSE_CATEGORIES[item.category]}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatShortDate(item.date)}
                    {item.note ? ` · ${item.note}` : ''}
                    {item.receiptPhoto ? ' · 📎 receipt' : ''}
                  </p>
                </div>
                <p className="font-bold text-red-500 text-sm flex-none">
                  -{formatCurrency(item.amount, currency)}
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

      {/* Add Expense Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); resetForm() }}
        title="Add Expense"
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
              options={EXPENSE_OPTIONS}
              selected={category}
              onChange={(v) => setCategory(v as ExpenseCategory)}
              color="red"
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
            placeholder="e.g. Market run, fuel, packaging…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />

          {/* Receipt photo */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Receipt Photo (optional)</label>
            {receiptPhoto ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receiptPhoto}
                  alt="Receipt"
                  className="w-full h-36 object-cover rounded-xl"
                />
                <button
                  onClick={() => setReceiptPhoto(undefined)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <Camera size={20} />
                <span className="text-xs">Tap to attach receipt</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <Button onClick={handleSave} variant="destructive" size="lg" className="w-full mt-2">
            Save Expense
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
