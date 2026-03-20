'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { storage } from '@/lib/storage'

export default function Root() {
  const router = useRouter()

  useEffect(() => {
    if (!storage.isOnboarded()) {
      router.replace('/onboarding')
    } else if (!storage.getSetup()?.setupDone) {
      router.replace('/setup')
    } else {
      router.replace('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-emerald-500 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium opacity-80">Loading...</p>
      </div>
    </div>
  )
}
