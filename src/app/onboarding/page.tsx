'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, TrendingUp, ScanLine, BarChart3 } from 'lucide-react'
import { storage } from '@/lib/storage'
import { Button } from '@/components/ui/button'

const SLIDES = [
  {
    Icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-600',
    emoji: '💰',
    title: 'Know Your Numbers',
    description:
      "Track every sale, every naira. Know exactly what's coming in and going out of your business — in real time.",
  },
  {
    Icon: ScanLine,
    gradient: 'from-blue-500 to-indigo-600',
    emoji: '📸',
    title: 'Never Miss a Thing',
    description:
      'Snap receipts, track who owes you money, and get reminded before recurring expenses hit.',
  },
  {
    Icon: BarChart3,
    gradient: 'from-violet-500 to-purple-600',
    emoji: '📊',
    title: 'Grow Smarter',
    description:
      'See your profit clearly, spot your top spending categories, and make smarter business decisions every day.',
  },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()

  const isLast = current === SLIDES.length - 1
  const slide = SLIDES[current]

  const complete = () => {
    storage.setOnboarded()
    router.push('/setup')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-[430px] mx-auto">
      {/* Slide area */}
      <div
        className={`flex-1 bg-gradient-to-br ${slide.gradient} flex flex-col items-center justify-center px-8 py-16 text-white transition-all duration-500`}
      >
        {/* Illustration */}
        <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-10 shadow-lg">
          <span className="text-6xl">{slide.emoji}</span>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold text-center mb-4 leading-tight">{slide.title}</h1>
        <p className="text-center text-white/80 text-base leading-relaxed max-w-xs">
          {slide.description}
        </p>

        {/* Dots */}
        <div className="flex gap-2 mt-14">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white px-6 py-8 flex items-center gap-4">
        <button
          onClick={complete}
          className="text-slate-400 font-medium text-sm min-w-[48px] hover:text-slate-600 transition-colors"
        >
          Skip
        </button>

        <Button
          onClick={() => (isLast ? complete() : setCurrent(current + 1))}
          size="lg"
          className="flex-1"
        >
          {isLast ? (
            'Get Started'
          ) : (
            <>
              Next <ChevronRight size={18} />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
