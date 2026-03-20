'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Bell, BellOff, AlertCircle } from 'lucide-react'
import { storage } from '@/lib/storage'
import { formatCurrency, formatShortDate, today, daysUntil } from '@/lib/format'
import {
  AppSetup,
  Reminder,
  ReminderFrequency,
  REMINDER_FREQUENCIES,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { CategoryChips } from '@/components/ui/category-chips'

const FREQ_OPTIONS = (
  Object.entries(REMINDER_FREQUENCIES) as [ReminderFrequency, string][]
).map(([value, label]) => ({ value, label }))

function getDueBadge(nextDue: string, isActive: boolean) {
  if (!isActive) return <Badge variant="neutral">Paused</Badge>
  const days = daysUntil(nextDue)
  if (days < 0) return <Badge variant="danger">Overdue</Badge>
  if (days === 0) return <Badge variant="warning">Due today</Badge>
  if (days === 1) return <Badge variant="warning">Tomorrow</Badge>
  if (days <= 3) return <Badge variant="warning">In {days} days</Badge>
  return <Badge variant="neutral">In {days} days</Badge>
}

export default function RemindersPage() {
  const [setup, setSetup] = useState<AppSetup | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [frequency, setFrequency] = useState<ReminderFrequency>('monthly')
  const [nextDue, setNextDue] = useState(today())
  const [titleError, setTitleError] = useState('')

  useEffect(() => {
    setSetup(storage.getSetup())
    setReminders(storage.getReminders())
  }, [])

  const currency = setup?.currency || 'NGN'

  const sorted = [...reminders].sort((a, b) => {
    if (!a.isActive && b.isActive) return 1
    if (a.isActive && !b.isActive) return -1
    return daysUntil(a.nextDue) - daysUntil(b.nextDue)
  })

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setCategory('')
    setFrequency('monthly')
    setNextDue(today())
    setTitleError('')
  }

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError('Enter a reminder title')
      return
    }
    const entry: Reminder = {
      id: crypto.randomUUID(),
      title: title.trim(),
      amount: parseFloat(amount) || 0,
      category: category.trim(),
      frequency,
      nextDue,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    storage.addReminder(entry)
    setReminders(storage.getReminders())
    setIsOpen(false)
    resetForm()
  }

  const toggleActive = (id: string, isActive: boolean) => {
    storage.updateReminder(id, { isActive: !isActive })
    setReminders(storage.getReminders())
  }

  const handleDelete = (id: string) => {
    storage.deleteReminder(id)
    setReminders(storage.getReminders())
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-rose-100 text-xs uppercase tracking-wide font-medium">Reminders</p>
            <h1 className="text-white text-2xl font-bold mt-1">Recurring Expenses</h1>
            <p className="text-rose-200 text-xs mt-0.5">
              {reminders.filter((r) => r.isActive).length} active reminder
              {reminders.filter((r) => r.isActive).length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Bell size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Add button */}
      <div className="px-4 py-4">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-rose-500 hover:bg-rose-600"
          size="lg"
        >
          <Plus size={20} /> Add Recurring Reminder
        </Button>
      </div>

      {/* List */}
      <div className="px-4 flex flex-col gap-3">
        {sorted.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
            <p className="text-5xl mb-3">🔔</p>
            <p className="text-slate-500 font-medium">No reminders set</p>
            <p className="text-slate-400 text-sm mt-1">
              Add reminders for rent, subscriptions, and bills
            </p>
          </div>
        ) : (
          sorted.map((reminder) => {
            const days = daysUntil(reminder.nextDue)
            const isUrgent = reminder.isActive && days <= 1
            return (
              <div
                key={reminder.id}
                className={`bg-white rounded-2xl px-4 py-4 border transition-all ${
                  isUrgent ? 'border-amber-200' : 'border-slate-100'
                } ${!reminder.isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{reminder.title}</p>
                      {getDueBadge(reminder.nextDue, reminder.isActive)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-400">
                        {REMINDER_FREQUENCIES[reminder.frequency]}
                      </p>
                      {reminder.category && (
                        <p className="text-xs text-slate-400">· {reminder.category}</p>
                      )}
                      <p className="text-xs text-slate-400">
                        · Due {formatShortDate(reminder.nextDue)}
                      </p>
                    </div>
                    {isUrgent && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <AlertCircle size={11} className="text-amber-500" />
                        <p className="text-xs text-amber-600 font-medium">
                          {days < 0 ? 'This was overdue!' : days === 0 ? 'Due today — don\'t forget!' : 'Due tomorrow!'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-none">
                    {reminder.amount > 0 && (
                      <p className="font-bold text-slate-700 text-sm">
                        {formatCurrency(reminder.amount, currency)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                  <button
                    onClick={() => toggleActive(reminder.id, reminder.isActive)}
                    className={`flex items-center gap-1.5 flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                      reminder.isActive
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {reminder.isActive ? (
                      <><BellOff size={13} /> Pause</>
                    ) : (
                      <><Bell size={13} /> Resume</>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Reminder Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); resetForm() }}
        title="Add Recurring Reminder"
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Title"
            placeholder="e.g. Shop Rent, Netflix, Data Plan…"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleError('') }}
            error={titleError}
            autoFocus
          />

          <Input
            label="Amount (optional)"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />

          <Input
            label="Category (optional)"
            placeholder="e.g. Rent, Utilities, Subscriptions…"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">How often?</label>
            <CategoryChips
              options={FREQ_OPTIONS}
              selected={frequency}
              onChange={(v) => setFrequency(v as ReminderFrequency)}
              color="emerald"
            />
          </div>

          <Input
            label="Next due date"
            type="date"
            value={nextDue}
            onChange={(e) => setNextDue(e.target.value)}
          />

          <Button
            onClick={handleSave}
            size="lg"
            className="w-full mt-2 bg-rose-500 hover:bg-rose-600"
          >
            Save Reminder
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
