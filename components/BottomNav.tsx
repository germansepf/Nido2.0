'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HouseIcon, CurrencyCircleDollarIcon, CalendarDotsIcon, PlantIcon, NotePencilIcon, SmileyWinkIcon } from '@phosphor-icons/react'

const navItems = [
  { href: '/dashboard', Icon: HouseIcon,                label: 'Inicio' },
  { href: '/finanzas',  Icon: CurrencyCircleDollarIcon, label: 'Finanzas' },
  { href: '/agenda',    Icon: CalendarDotsIcon,          label: 'Agenda' },
  { href: '/habitos',   Icon: PlantIcon,                 label: 'Hábitos' },
  { href: '/notas',     Icon: NotePencilIcon,            label: 'Notas' },
  { href: '/humor',     Icon: SmileyWinkIcon,            label: 'Humor' },
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
          {navItems.map(({ href, Icon, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl
                  transition-all duration-200 min-w-0
                  ${active ? 'bg-nido-rose-pale' : 'hover:bg-nido-linen'}
                `}
              >
                <Icon
                  size={active ? 22 : 19}
                  weight={active ? 'duotone' : 'regular'}
                  color={active ? '#c4786a' : '#c0aa98'}
                  className="transition-all duration-200"
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
