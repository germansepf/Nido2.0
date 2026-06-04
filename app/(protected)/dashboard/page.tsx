'use client'

import Link from 'next/link'
import { TrendingUp, CalendarDays, Repeat2, FileText, Smile, LogOut, ChevronRight, Flame } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useMonthSummary } from '@/hooks/useFinanzas'
import { useTasks, useEvents } from '@/hooks/useAgenda'
import { useHabits, useHabitLogs, useStreak, getWeekDates } from '@/hooks/useHabitos'
import { useTodayMood } from '@/hooks/useHumor'
import { useEffect, useState } from 'react'

const FRASES = [
  'Lo que cuidas, crece.',
  'Un día a la vez, un hábito a la vez.',
  'Construye tus días con intención.',
  'Cada pequeño paso cuenta.',
  'Hoy es un buen día para empezar.',
  'La constancia es la magia.',
  'Pequeñas acciones, grandes cambios.',
  'Tu nido, tu paz.',
  'Cuidarte es prioridad.',
  'Hoy vale el intento.',
  'Progreso, no perfección.',
  'Todo fluye cuando te escuchas.',
]

function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatCompact(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, notation: 'compact' }).format(amount)
}

function getGreeting(name: string) {
  const h = new Date().getHours()
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
  return name ? `${saludo}, ${name}` : saludo
}

function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(dateStr + 'T12:00:00')
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function nameFromEmail(email: string) {
  const local = email.split('@')[0]
  const name  = local.split(/[._\-0-9]/)[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
}

// ─── Streak badge for dashboard ───────────────────────────────
function BestStreak({ habits }: { habits: { id: string }[] }) {
  const streaks = habits.map(h => useStreak(h.id))
  const max = Math.max(0, ...streaks.map(s => s.data ?? 0))
  if (max === 0) return null
  return (
    <span className="flex items-center gap-0.5 text-xs font-bold text-nido-amber">
      <Flame className="w-3.5 h-3.5" />{max}
    </span>
  )
}

const MODULES = [
  { href: '/finanzas', icon: TrendingUp,  label: 'Finanzas', iconColor: 'text-nido-rose',          bgColor: 'bg-nido-rose-pale' },
  { href: '/agenda',   icon: CalendarDays, label: 'Agenda',   iconColor: 'text-nido-lavender-deep', bgColor: 'bg-nido-lavender-pale' },
  { href: '/habitos',  icon: Repeat2,      label: 'Hábitos',  iconColor: 'text-nido-sage-deep',     bgColor: 'bg-nido-sage-pale' },
  { href: '/notas',    icon: FileText,     label: 'Notas',    iconColor: 'text-nido-amber',         bgColor: 'bg-nido-amber-pale' },
  { href: '/humor',    icon: Smile,        label: 'Humor',    iconColor: 'text-nido-rose-deep',     bgColor: 'bg-nido-rose-pale' },
]

export default function DashboardPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [userEmail, setUserEmail] = useState('')
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email)
    })
  }, [])

  const userName = userEmail ? nameFromEmail(userEmail) : ''
  const frase    = FRASES[new Date().getDate() % FRASES.length]

  const month                   = getCurrentMonth()
  const summary                 = useMonthSummary(month)
  const { data: tasks = [] }    = useTasks()
  const { data: events = [] }   = useEvents()
  const weekDates               = getWeekDates()
  const { data: habits = [] }   = useHabits()
  const { data: habitLogs = [] }= useHabitLogs(weekDates)
  const { data: todayMood }     = useTodayMood()

  const today          = new Date().toISOString().split('T')[0]
  const pendingToday   = tasks.filter(t => t.type === 'today' && !t.done).length
  const completedHabits= habits.filter(h => habitLogs.some(l => l.habit_id === h.id && l.date === today)).length
  const nextEvent      = events[0] ?? null

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div className="flex items-start justify-between pt-8 pb-4">
        <div>
          <p className="text-[11px] font-medium text-nido-mist tracking-wider uppercase">
            {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display text-[2rem] leading-tight text-nido-ink mt-0.5">
            {getGreeting(userName)}
          </h1>
          {frase && (
            <p className="text-xs text-nido-mauve mt-1 italic animate-fade-up" style={{ animationDelay: '200ms' }}>
              {frase}
            </p>
          )}
        </div>
        <button onClick={handleLogout} className="mt-1 p-2 rounded-xl text-nido-mist hover:text-nido-rose hover:bg-nido-rose-pale transition-all">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mood del día */}
      {todayMood && (
        <Link href="/humor"
          className="card card-lift px-4 py-3.5 mb-4 flex items-center gap-3.5"
        >
          <span className="text-[2rem] leading-none shrink-0">{todayMood.mood}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-nido-mist mb-0.5">Hoy me siento</p>
            {todayMood.note
              ? <p className="text-sm text-nido-ink truncate">{todayMood.note}</p>
              : <p className="text-sm text-nido-mauve">Sin nota hoy</p>
            }
          </div>
          <ChevronRight className="w-4 h-4 text-nido-mist shrink-0" />
        </Link>
      )}

      {/* Próximo evento */}
      {nextEvent && (
        <Link href="/agenda"
          className="card card-lift px-4 py-3 mb-4 flex items-center gap-3 animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          <div className="w-9 h-9 rounded-xl bg-nido-sage-pale flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 text-nido-sage-deep" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist mb-0.5">Próximo evento</p>
            <p className="text-sm text-nido-ink truncate">{nextEvent.text}</p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${
            daysUntil(nextEvent.date) === 0
              ? 'bg-nido-rose-pale text-nido-rose-deep'
              : daysUntil(nextEvent.date) <= 3
              ? 'bg-nido-amber-pale text-nido-amber'
              : 'bg-nido-linen text-nido-mauve'
          }`}>
            {daysUntil(nextEvent.date) === 0 ? 'Hoy' : daysUntil(nextEvent.date) === 1 ? 'Mañana' : `${daysUntil(nextEvent.date)}d`}
          </span>
        </Link>
      )}

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <Link href="/finanzas" className="card card-lift p-3 text-center animate-fade-up" style={{ animationDelay: '60ms' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Balance</p>
          <p className={`text-sm font-semibold truncate ${summary.balance >= 0 ? 'text-nido-sage-deep' : 'text-nido-rose'}`}>
            {formatCompact(summary.balance)}
          </p>
        </Link>

        <Link href="/agenda" className="card card-lift p-3 text-center animate-fade-up" style={{ animationDelay: '100ms' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Hoy</p>
          <p className="text-sm font-semibold text-nido-lavender-deep">
            {pendingToday} <span className="text-[10px] font-normal text-nido-mauve">{pendingToday === 1 ? 'tarea' : 'tareas'}</span>
          </p>
        </Link>

        <Link href="/habitos" className="card card-lift p-3 text-center animate-fade-up" style={{ animationDelay: '140ms' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Hábitos</p>
          <p className="text-sm font-semibold text-nido-sage-deep">
            {completedHabits}<span className="text-nido-mist font-normal">/{habits.length}</span>
          </p>
        </Link>
      </div>

      {/* Módulos */}
      <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-nido-mist mb-3">Módulos</p>
      <div className="grid grid-cols-2 gap-2.5">
        {MODULES.map(({ href, icon: Icon, label, iconColor, bgColor }, i) => (
          <Link key={href} href={href}
            className="card card-lift p-4 flex items-center gap-3 group animate-fade-up"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor} transition-transform duration-200 group-hover:scale-110`}>
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
