'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckCircle, Trash2, Users, Phone } from 'lucide-react'
import { storage } from '@/lib/storage'
import { formatCurrency, formatShortDate } from '@/lib/format'
import { AppSetup, Debtor } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { BottomSheet } from '@/components/ui/bottom-sheet'

export default function DebtorsPage() {
  const [setup, setSetup] = useState<AppSetup | null>(null)
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'outstanding' | 'paid'>('outstanding')

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [nameError, setNameError] = useState('')
  const [amountError, setAmountError] = useState('')

  useEffect(() => {
    setSetup(storage.getSetup())
    setDebtors(storage.getDebtors())
  }, [])

  const currency = setup?.currency || 'NGN'

  const outstanding = debtors.filter((d) => !d.isPaid)
  const paid = debtors.filter((d) => d.isPaid)
  const totalOwed = outstanding.reduce((s, d) => s + d.amount, 0)

  const filtered = filter === 'all' ? debtors : filter === 'outstanding' ? outstanding : paid

  const resetForm = () => {
    setName('')
    setPhone('')
    setAmount('')
    setDueDate('')
    setNote('')
    setNameError('')
    setAmountError('')
  }

  const handleSave = () => {
    let valid = true
    if (!name.trim()) { setNameError('Enter debtor name'); valid = false }
    const num = parseFloat(amount)
    if (!amount || isNaN(num) || num <= 0) { setAmountError('Enter a valid amount'); valid = false }
    if (!valid) return

    const entry: Debtor = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      amount: num,
      note: note.trim() || undefined,
      dueDate: dueDate || undefined,
      isPaid: false,
      createdAt: new Date().toISOString(),
    }
    storage.addDebtor(entry)
    setDebtors(storage.getDebtors())
    setIsOpen(false)
    resetForm()
  }

  const markPaid = (id: string) => {
    storage.updateDebtor(id, { isPaid: true, paidAt: new Date().toISOString() })
    setDebtors(storage.getDebtors())
  }

  const handleDelete = (id: string) => {
    storage.deleteDebtor(id)
    setDebtors(storage.getDebtors())
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-xs uppercase tracking-wide font-medium">
              Total Outstanding
            </p>
            <p className="text-white text-3xl font-bold mt-1">
              {formatCurrency(totalOwed, currency)}
            </p>
            <p className="text-amber-200 text-xs mt-1">
              {outstanding.length} debtor{outstanding.length !== 1 ? 's' : ''} owe you
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Users size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* Add button */}
      <div className="px-4 py-4">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-amber-500 hover:bg-amber-600"
          size="lg"
        >
          <Plus size={20} /> Add Debtor
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          {(['outstanding', 'paid', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              {f} {f === 'outstanding' ? `(${outstanding.length})` : f === 'paid' ? `(${paid.length})` : `(${debtors.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
            <p className="text-5xl mb-3">🤝</p>
            <p className="text-slate-500 font-medium">
              {filter === 'outstanding' ? 'No outstanding debtors' : filter === 'paid' ? 'No paid debtors yet' : 'No debtors yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === 'outstanding' && 'Everyone has paid up!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((debtor) => (
              <div
                key={debtor.id}
                className={`bg-white rounded-2xl px-4 py-4 border ${
                  debtor.isPaid ? 'border-slate-100 opacity-60' : 'border-amber-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-slate-800 ${debtor.isPaid ? 'line-through' : ''}`}>
                        {debtor.name}
                      </p>
                      <Badge variant={debtor.isPaid ? 'success' : 'warning'}>
                        {debtor.isPaid ? 'Paid' : 'Owes you'}
                      </Badge>
                    </div>
                    {debtor.phone && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone size={10} className="text-slate-400" />
                        <p className="text-xs text-slate-400">{debtor.phone}</p>
                      </div>
                    )}
                    {debtor.note && <p className="text-xs text-slate-400 mt-0.5">{debtor.note}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-400">Added {formatShortDate(debtor.createdAt.split('T')[0])}</p>
                      {debtor.dueDate && !debtor.isPaid && (
                        <p className="text-xs text-amber-600 font-medium">
                          · Due {formatShortDate(debtor.dueDate)}
                        </p>
                      )}
                      {debtor.isPaid && debtor.paidAt && (
                        <p className="text-xs text-emerald-600">
                          · Paid {formatShortDate(debtor.paidAt.split('T')[0])}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-none">
                    <p className={`font-bold text-base ${debtor.isPaid ? 'text-slate-400' : 'text-amber-600'}`}>
                      {formatCurrency(debtor.amount, currency)}
                    </p>
                  </div>
                </div>

                {!debtor.isPaid && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-50">
                    <Button
                      onClick={() => markPaid(debtor.id)}
                      variant="secondary"
                      size="sm"
                      className="flex-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                    >
                      <CheckCircle size={14} /> Mark Paid
                    </Button>
                    <button
                      onClick={() => handleDelete(debtor.id)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                {debtor.isPaid && (
                  <button
                    onClick={() => handleDelete(debtor.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Debtor Sheet */}
      <BottomSheet
        isOpen={isOpen}
        onClose={() => { setIsOpen(false); resetForm() }}
        title="Add Debtor"
      >
        <div className="flex flex-col gap-5">
          <Input
            label="Name"
            placeholder="Who owes you?"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError('') }}
            error={nameError}
            autoFocus
          />
          <Input
            label="Amount owed"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setAmountError('') }}
            error={amountError}
            inputMode="decimal"
          />
          <Input
            label="Phone (optional)"
            type="tel"
            placeholder="+234 800 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Due date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Textarea
            label="Note (optional)"
            placeholder="What was this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full mt-2 bg-amber-500 hover:bg-amber-600"
          >
            Save Debtor
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}
