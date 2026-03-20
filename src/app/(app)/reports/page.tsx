'use client'

import { useState, useEffect } from 'react'
import { Download, BarChart3 } from 'lucide-react'
import { storage } from '@/lib/storage'
import { formatCurrency, getMonthRange, monthLabel } from '@/lib/format'
import { AppSetup, Income, Expense, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { exportToExcel } from '@/lib/export'

type Period = 'this_month' | 'last_month' | 'all_time'

function getPeriod(p: Period): { start: string; end: string } | undefined {
  if (p === 'all_time') return undefined
  const now = new Date()
  if (p === 'this_month') return getMonthRange(now)
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return getMonthRange(last)
}

function CategoryBar({
  label,
  amount,
  total,
  color,
  setup,
}: {
  label: string
  amount: number
  total: number
  color: string
  setup: AppSetup | null
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-700 font-medium">{label}</p>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-800">
            {formatCurrency(amount, (setup?.currency) || 'NGN')}
          </p>
          <p className="text-[10px] text-slate-400">{pct.toFixed(0)}%</p>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [setup, setSetup] = useState<AppSetup | null>(null)
  const [income, setIncome] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [period, setPeriod] = useState<Period>('this_month')

  useEffect(() => {
    setSetup(storage.getSetup())
    setIncome(storage.getIncome())
    setExpenses(storage.getExpenses())
  }, [])

  const currency = setup?.currency || 'NGN'
  const range = getPeriod(period)

  const filteredIncome = range
    ? income.filter((i) => i.date >= range.start && i.date <= range.end)
    : income
  const filteredExpenses = range
    ? expenses.filter((e) => e.date >= range.start && e.date <= range.end)
    : expenses

  const totalIncome = filteredIncome.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0)
  const profit = totalIncome - totalExpenses

  // Group by category
  const incomeByCategory: Record<string, number> = {}
  filteredIncome.forEach((i) => {
    incomeByCategory[i.category] = (incomeByCategory[i.category] || 0) + i.amount
  })

  const expenseByCategory: Record<string, number> = {}
  filteredExpenses.forEach((e) => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount
  })

  const sortedIncome = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1])
  const sortedExpenses = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])

  const periodLabel = (() => {
    if (period === 'all_time') return 'All Time'
    const now = new Date()
    if (period === 'this_month') return monthLabel(now)
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return monthLabel(last)
  })()

  const handleExport = () => {
    exportToExcel(income, expenses, storage.getDebtors(), setup?.currency || 'NGN')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-violet-100 text-xs uppercase tracking-wide font-medium">Reports</p>
            <h1 className="text-white text-2xl font-bold mt-1">Sales Breakdown</h1>
            <p className="text-violet-200 text-xs mt-0.5">{periodLabel}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <BarChart3 size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Period filter */}
      <div className="px-4 py-4">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {([
            ['this_month', 'This Month'],
            ['last_month', 'Last Month'],
            ['all_time', 'All Time'],
          ] as [Period, string][]).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                period === p ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="pr-3">
              <p className="text-[11px] text-slate-500 mb-1">Income</p>
              <p className="text-emerald-600 font-bold text-sm">{formatCurrency(totalIncome, currency)}</p>
            </div>
            <div className="px-3 text-center">
              <p className="text-[11px] text-slate-500 mb-1">Profit</p>
              <p className={`font-bold text-sm ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {profit >= 0 ? '' : '-'}{formatCurrency(Math.abs(profit), currency)}
              </p>
            </div>
            <div className="pl-3 text-right">
              <p className="text-[11px] text-slate-500 mb-1">Expenses</p>
              <p className="text-red-500 font-bold text-sm">{formatCurrency(totalExpenses, currency)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Income breakdown */}
      <div className="px-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Income by Category</h2>
        {sortedIncome.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100">
            <p className="text-slate-400 text-sm">No income for this period</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col gap-4">
            {sortedIncome.map(([cat, amount]) => (
              <CategoryBar
                key={cat}
                label={INCOME_CATEGORIES[cat as keyof typeof INCOME_CATEGORIES] || cat}
                amount={amount}
                total={totalIncome}
                color="bg-emerald-500"
                setup={setup}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expense breakdown */}
      <div className="px-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Expenses by Category</h2>
        {sortedExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-100">
            <p className="text-slate-400 text-sm">No expenses for this period</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col gap-4">
            {sortedExpenses.map(([cat, amount]) => (
              <CategoryBar
                key={cat}
                label={EXPENSE_CATEGORIES[cat as keyof typeof EXPENSE_CATEGORIES] || cat}
                amount={amount}
                total={totalExpenses}
                color="bg-red-500"
                setup={setup}
              />
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="px-4 mb-6">
        <Button
          onClick={handleExport}
          variant="outline"
          size="lg"
          className="w-full"
          disabled={income.length === 0 && expenses.length === 0}
        >
          <Download size={18} /> Export to Excel (.xlsx)
        </Button>
        <p className="text-center text-xs text-slate-400 mt-2">
          Exports all income, expenses & debtors
        </p>
      </div>
    </div>
  )
}
