'use client'

import Link from 'next/link'
import {
  TrendingUp,
  CalendarDays,
  Repeat2,
  FileText,
  Smile,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useMonthSummary } from '@/hooks/useFinanzas'
import { useTasks } from '@/hooks/useAgenda'
import { useHabits, useHabitLogs, getWeekDates } from '@/hooks/useHabitos'
import { useTodayMood } from '@/hooks/useHumor'

function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    notation: 'compact',
  }).format(amount)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const MODULES = [
  {
    href: '/finanzas',
    icon: TrendingUp,
    label: 'Finanzas',
    iconColor: 'text-nido-rose',
    bgColor: 'bg-nido-rose-pale',
  },
  {
    href: '/agenda',
    icon: CalendarDays,
    label: 'Agenda',
    iconColor: 'text-nido-lavender-deep',
    bgColor: 'bg-nido-lavender-pale',
  },
  {
    href: '/habitos',
    icon: Repeat2,
    label: 'Hábitos',
    iconColor: 'text-nido-sage-deep',
    bgColor: 'bg-nido-sage-pale',
  },
  {
    href: '/notas',
    icon: FileText,
    label: 'Notas',
    iconColor: 'text-nido-amber',
    bgColor: 'bg-nido-amber-pale',
  },
  {
    href: '/humor',
    icon: Smile,
    label: 'Humor',
    iconColor: 'text-nido-rose-deep',
    bgColor: 'bg-nido-rose-pale',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const month = getCurrentMonth()
  const summary = useMonthSummary(month)
  const { data: tasks = [] } = useTasks()
  const weekDates = getWeekDates()
  const { data: habits = [] } = useHabits()
  const { data: habitLogs = [] } = useHabitLogs(weekDates)
  const { data: todayMood } = useTodayMood()

  const today = new Date().toISOString().split('T')[0]
  const pendingToday = tasks.filter((t) => t.type === 'today' && !t.done).length
  const completedHabits = habits.filter((h) =>
    habitLogs.some((l) => l.habit_id === h.id && l.date === today)
  ).length

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between pt-8 pb-5">
        <div>
          <p className="text-[11px] font-medium text-nido-mist tracking-wider uppercase">
            {getGreeting()}
          </p>
          <h1 className="font-display text-[2rem] leading-tight text-nido-ink mt-0.5">
            Mi Nido
          </h1>
          <p className="text-xs text-nido-mauve mt-1 capitalize">
            {new Date().toLocaleDateString('es', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 p-2 rounded-xl text-nido-mist hover:text-nido-rose hover:bg-nido-rose-pale transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mood del día */}
      {todayMood && (
        <Link
          href="/humor"
          className="card px-4 py-3.5 mb-5 flex items-center gap-3.5 hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <span className="text-[2rem] leading-none shrink-0">{todayMood.mood}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-nido-mist mb-0.5">
              Hoy me siento
            </p>
            {todayMood.note ? (
              <p className="text-sm text-nido-ink truncate">{todayMood.note}</p>
            ) : (
              <p className="text-sm text-nido-mauve">Sin nota hoy</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-nido-mist shrink-0" />
        </Link>
      )}

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <Link
          href="/finanzas"
          className="card p-3 text-center hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">
            Balance
          </p>
          <p
            className={`text-sm font-semibold truncate ${
              summary.balance >= 0 ? 'text-nido-sage-deep' : 'text-nido-rose'
            }`}
          >
            {formatCurrency(summary.balance)}
          </p>
        </Link>

        <Link
          href="/agenda"
          className="card p-3 text-center hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">
            Hoy
          </p>
          <p className="text-sm font-semibold text-nido-lavender-deep">
            {pendingToday}{' '}
            <span className="text-[10px] font-normal text-nido-mauve">
              {pendingToday === 1 ? 'tarea' : 'tareas'}
            </span>
          </p>
        </Link>

        <Link
          href="/habitos"
          className="card p-3 text-center hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">
            Hábitos
          </p>
          <p className="text-sm font-semibold text-nido-sage-deep">
            {completedHabits}
            <span className="text-nido-mist font-normal">/{habits.length}</span>
          </p>
        </Link>
      </div>

      {/* Módulos */}
      <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-nido-mist mb-3">
        Módulos
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {MODULES.map(({ href, icon: Icon, label, iconColor, bgColor }, i) => (
          <Link
            key={href}
            href={href}
            className="card p-4 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 group animate-fade-up"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.8} />
            </div>
            <span className="text-sm font-medium text-nido-ink flex-1">{label}</span>
            <ChevronRight className="w-3.5 h-3.5 text-nido-mist opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  )
}
