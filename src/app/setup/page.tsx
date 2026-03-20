'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { storage } from '@/lib/storage'
import { CURRENCIES, Currency } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SetupPage() {
  const [businessName, setBusinessName] = useState('')
  const [currency, setCurrency] = useState<Currency>('NGN')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessName.trim()) {
      setError('Please enter your business name')
      return
    }
    storage.saveSetup({ businessName: businessName.trim(), currency, setupDone: true })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-16 pb-12 text-white">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
          <Sparkles size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Set up your business</h1>
        <p className="text-emerald-100 text-sm leading-relaxed">
          Just two quick things and you are ready to track your cash flow.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 py-8 flex flex-col gap-6">
        <Input
          label="Business name"
          placeholder="e.g. Bae's Kitchen, Glamour Closet…"
          value={businessName}
          onChange={(e) => {
            setBusinessName(e.target.value)
            setError('')
          }}
          error={error}
          autoFocus
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700">Currency</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(CURRENCIES) as [Currency, { symbol: string; name: string }][]).map(
              ([code, { symbol, name }]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    currency === code
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-base">{symbol}</span>
                  <div className="text-left">
                    <div className="font-semibold text-xs">{code}</div>
                    <div className="text-[10px] text-slate-500 truncate">{name}</div>
                  </div>
                </button>
              ),
            )}
          </div>
        </div>

        <div className="mt-auto">
          <Button type="submit" size="lg" className="w-full">
            I am Ready! 🚀
          </Button>
          <p className="text-center text-xs text-slate-400 mt-3">
            You can change these later in Settings
          </p>
        </div>
      </form>
    </div>
  )
}
