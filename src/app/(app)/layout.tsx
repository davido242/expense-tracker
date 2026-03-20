import { BottomNav } from '@/components/layout/bottom-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-slate-50 relative">
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
