'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Plus, Users, Bell, ChevronRight } from 'lucide-react'
import { storage } from '@/lib/storage'
import {
  formatCurrency,
  formatShortDate,
  getMonthRange,
  monthLabel,
  daysUntil,
} from '@/lib/format'
import {
  AppSetup,
  Income,
  Expense,
  Reminder,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '@/lib/types'

type Transaction =
  | (Income & { type: 'income' })
  | (Expense & { type: 'expense' })

export default function DashboardPage() {
  const [setup, setSetup] = useState<AppSetup | null>(null)
  const [income, setIncome] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    setSetup(storage.getSetup())
    setIncome(storage.getIncome())
    setExpenses(storage.getExpenses())
    setReminders(storage.getReminders())
  }, [])

  const currency = setup?.currency || 'NGN'
  const range = getMonthRange()

  const thisMonthIncome = income
    .filter((i) => i.date >= range.start && i.date <= range.end)
    .reduce((s, i) => s + i.amount, 0)
  const thisMonthExpenses = expenses
    .filter((e) => e.date >= range.start && e.date <= range.end)
    .reduce((s, e) => s + e.amount, 0)
  const profit = thisMonthIncome - thisMonthExpenses
  const spentPct = thisMonthIncome > 0 ? Math.min((thisMonthExpenses / thisMonthIncome) * 100, 100) : 0

  const recent: Transaction[] = [
    ...income.map((i) => ({ ...i, type: 'income' as const })),
    ...expenses.map((e) => ({ ...e, type: 'expense' as const })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const dueReminders = reminders.filter((r) => r.isActive && daysUntil(r.nextDue) <= 3)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-14 pb-28">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-emerald-100 text-sm">{greeting} 👋</p>
            <h1 className="text-white text-xl font-bold mt-0.5">
              {setup?.businessName || 'CashFlow Babe'}
            </h1>
            <p className="text-emerald-200 text-xs mt-0.5">{monthLabel()}</p>
          </div>
          <Link
            href="/reminders"
            className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <Bell size={18} className="text-white" />
            {dueReminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {dueReminders.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Stats card */}
      <div className="px-4 -mt-20">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="pr-4">
              <p className="text-[11px] text-slate-500 mb-1">Income</p>
              <p className="text-emerald-600 font-bold text-sm leading-tight">
                {formatCurrency(thisMonthIncome, currency)}
              </p>
            </div>
            <div className="px-4 text-center">
              <p className="text-[11px] text-slate-500 mb-1">Profit</p>
              <p
                className={`font-bold text-sm leading-tight ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
              >
                {profit >= 0 ? '' : '-'}
                {formatCurrency(Math.abs(profit), currency)}
              </p>
            </div>
            <div className="pl-4 text-right">
              <p className="text-[11px] text-slate-500 mb-1">Expenses</p>
              <p className="text-red-500 font-bold text-sm leading-tight">
                {formatCurrency(thisMonthExpenses, currency)}
              </p>
            </div>
          </div>

          {thisMonthIncome > 0 && (
            <div className="mt-4">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${spentPct >= 90 ? 'bg-red-500' : spentPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${spentPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 text-right">
                {Math.round(spentPct)}% of income spent
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/income"
          className="flex items-center gap-3 bg-emerald-500 text-white rounded-2xl px-4 py-3.5 shadow-sm active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm">Add Income</p>
            <p className="text-emerald-100 text-[10px]">Record a sale</p>
          </div>
        </Link>
        <Link
          href="/expenses"
          className="flex items-center gap-3 bg-red-500 text-white rounded-2xl px-4 py-3.5 shadow-sm active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm">Add Expense</p>
            <p className="text-red-100 text-[10px]">Log a cost</p>
          </div>
        </Link>
      </div>

      {/* Due reminders */}
      {dueReminders.length > 0 && (
        <div className="px-4 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell size={14} className="text-amber-600" />
              <p className="text-sm font-semibold text-amber-800">Upcoming</p>
            </div>
            {dueReminders.slice(0, 2).map((r) => {
              const days = daysUntil(r.nextDue)
              return (
                <div key={r.id} className="flex items-center justify-between py-1">
                  <p className="text-sm text-amber-800">{r.title}</p>
                  <p className="text-xs text-amber-600 font-medium">
                    {days <= 0 ? 'Overdue' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick links row */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <Link
          href="/debtors"
          className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-slate-100 active:bg-slate-50 transition-colors"
        >
          <Users size={16} className="text-slate-500" />
          <span className="text-sm text-slate-700 font-medium">Debtors</span>
          <ChevronRight size={14} className="text-slate-400 ml-auto" />
        </Link>
        <Link
          href="/reports"
          className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-slate-100 active:bg-slate-50 transition-colors"
        >
          <TrendingUp size={16} className="text-slate-500" />
          <span className="text-sm text-slate-700 font-medium">Reports</span>
          <ChevronRight size={14} className="text-slate-400 ml-auto" />
        </Link>
      </div>

      {/* Recent transactions */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 text-sm">Recent Transactions</h2>
        </div>

        {recent.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-slate-500 text-sm font-medium">No transactions yet</p>
            <p className="text-slate-400 text-xs mt-1">Tap Add Income or Add Expense to start</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
            {recent.map((tx, i) => (
              <div
                key={tx.id}
                className={`px-4 py-3 flex items-center gap-3 ${i > 0 ? 'border-t border-slate-50' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-none ${
                    tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <TrendingUp size={15} className="text-emerald-600" />
                  ) : (
                    <TrendingDown size={15} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {tx.type === 'income'
                      ? INCOME_CATEGORIES[tx.category as keyof typeof INCOME_CATEGORIES]
                      : EXPENSE_CATEGORIES[tx.category as keyof typeof EXPENSE_CATEGORIES]}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatShortDate(tx.date)}
                    {tx.note ? ` · ${tx.note}` : ''}
                  </p>
                </div>
                <p
                  className={`font-semibold text-sm flex-none ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount, currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
