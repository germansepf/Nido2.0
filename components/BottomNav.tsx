'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  CalendarDays,
  Repeat2,
  FileText,
  Smile,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/finanzas', icon: TrendingUp, label: 'Finanzas' },
  { href: '/agenda', icon: CalendarDays, label: 'Agenda' },
  { href: '/habitos', icon: Repeat2, label: 'Hábitos' },
  { href: '/notas', icon: FileText, label: 'Notas' },
  { href: '/humor', icon: Smile, label: 'Humor' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegación principal" className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div
        className="border-t border-nido-rose-pale backdrop-blur-xl"
        style={{
          background: 'rgba(254,250,251,0.93)',
          boxShadow: '0 -4px 24px -6px rgba(220,107,132,0.12)',
        }}
      >
        <div className="flex items-center justify-around max-w-lg mx-auto px-1 py-1.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl
                  transition-all duration-200 min-w-0
                  ${active
                    ? 'bg-nido-rose-pale'
                    : 'hover:bg-nido-linen'
                  }
                `}
              >
                <Icon
                  className={`transition-all duration-200 ${
                    active
                      ? 'text-nido-rose w-[1.15rem] h-[1.15rem]'
                      : 'text-nido-mist w-[1.05rem] h-[1.05rem]'
                  }`}
                  strokeWidth={active ? 2.3 : 1.7}
                />
                <span
                  className={`text-[9.5px] leading-none font-medium truncate transition-colors duration-200 ${
                    active ? 'text-nido-rose' : 'text-nido-mist'
                  }`}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
