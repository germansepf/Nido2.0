'use client'

import { useState } from 'react'
import { PlusCircleIcon, TrashIcon, FlameIcon, CalendarDotsIcon } from '@phosphor-icons/react'
import {
  useHabits, useHabitLogs, useMonthHabitLogs, useToggleHabitLog,
  useAddHabit, useDeleteHabit, useStreak, getWeekDates, getLast28Dates,
} from '@/hooks/useHabitos'
import type { Habit, HabitLog } from '@/lib/types'

const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// ─── Progress bar ─────────────────────────────────────────────
function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div className="card p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">Hoy</p>
        <span className="text-sm font-bold text-nido-sage-deep">
          {completed}<span className="text-nido-mist font-normal text-xs">/{total}</span>
        </span>
      </div>
      <div className="h-2.5 bg-nido-linen rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-nido-sage to-nido-sage-deep rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && total > 0 && (
        <p className="text-[10px] text-nido-sage-deep font-medium mt-1.5 text-center animate-pop">
          ¡Todos completados! 🌿
        </p>
      )}
    </div>
  )
}

// ─── Monthly Stats ────────────────────────────────────────────
function MonthStats({ habitCount }: { habitCount: number }) {
  const { data: monthLogs = [] } = useMonthHabitLogs()
  const today       = new Date()
  const dayOfMonth  = today.getDate()
  const last28      = getLast28Dates()

  const daysWithAllHabits = last28.slice(-dayOfMonth).filter(date => {
    const unique = new Set(monthLogs.filter(l => l.date === date).map(l => l.habit_id)).size
    return habitCount > 0 && unique >= habitCount
  }).length

  const pct = dayOfMonth > 0 ? Math.round((daysWithAllHabits / dayOfMonth) * 100) : 0

  return (
    <div className="grid grid-cols-2 gap-2.5 mb-3">
      <div className="card p-3 text-center animate-fade-up">
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Días perfectos</p>
        <p className="text-xl font-bold text-nido-sage-deep">{daysWithAllHabits}</p>
        <p className="text-[9px] text-nido-mist mt-0.5">este mes</p>
      </div>
      <div className="card p-3 text-center animate-fade-up" style={{ animationDelay: '60ms' }}>
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Constancia</p>
        <p className="text-xl font-bold text-nido-amber">{pct}%</p>
        <p className="text-[9px] text-nido-mist mt-0.5">{dayOfMonth} días</p>
      </div>
    </div>
  )
}

// ─── 28-day Heatmap ───────────────────────────────────────────
function MonthHeatmap({ habitId, monthLogs }: { habitId: string; monthLogs: HabitLog[] }) {
  const toggle  = useToggleHabitLog()
  const last28  = getLast28Dates()
  const today   = new Date().toISOString().split('T')[0]

  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map(d => (
          <span key={d} className="text-[7px] text-nido-mist text-center font-medium">{d}</span>
        ))}
        {last28.map(date => {
          const log      = monthLogs.find(l => l.habit_id === habitId && l.date === date)
          const isLogged = !!log
          const isToday  = date === today
          const isFuture = date > today
          return (
            <button key={date} title={date} disabled={isFuture}
              onClick={() => !isFuture && toggle.mutate({ habitId, date, isLogged, logId: log?.id })}
              className={`aspect-square rounded-sm transition-all duration-200 ${
                isLogged
                  ? 'bg-nido-sage shadow-[0_1px_4px_-1px_rgba(122,148,96,0.5)]'
                  : isToday
                  ? 'border-2 border-nido-rose bg-transparent'
                  : isFuture
                  ? 'bg-nido-linen opacity-20'
                  : 'bg-nido-linen hover:bg-nido-sage-pale'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Weekly Grid ──────────────────────────────────────────────
function WeeklyGrid({ habitId, weekDates, logs }: { habitId: string; weekDates: string[]; logs: HabitLog[] }) {
  const toggle = useToggleHabitLog()
  const today  = new Date().toISOString().split('T')[0]

  return (
    <div className="flex gap-1.5 mt-2.5">
      {weekDates.map((date, i) => {
        const log      = logs.find(l => l.habit_id === habitId && l.date === date)
        const isToday  = date === today
        const isPast   = date <= today
        const isLogged = !!log
        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <span className="text-[8px] text-nido-mist font-medium">{DAY_NAMES[i]}</span>
            <button
              onClick={() => isPast && toggle.mutate({ habitId, date, isLogged, logId: log?.id })}
              disabled={!isPast}
              className={`w-6 h-6 rounded-full transition-all duration-200 ${
                isLogged
                  ? 'bg-nido-sage shadow-[0_2px_6px_-1px_rgba(122,148,96,0.4)]'
                  : isToday
                  ? 'border-2 border-nido-rose bg-transparent'
                  : isPast
                  ? 'bg-nido-linen hover:bg-nido-sage-pale'
                  : 'bg-nido-linen opacity-30'
              }`}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Streak Badge ─────────────────────────────────────────────
function StreakBadge({ habitId }: { habitId: string }) {
  const { data: streak = 0 } = useStreak(habitId)
  if (streak === 0) return null
  return (
    <span className="flex items-center gap-0.5 text-xs font-bold text-nido-amber">
      <FlameIcon size={14} weight="duotone" />
      {streak}
    </span>
  )
}

// ─── Habit Row ────────────────────────────────────────────────
function HabitRow({ habit, weekDates, logs, monthLogs, viewMode }: {
  habit: Habit; weekDates: string[]; logs: HabitLog[]; monthLogs: HabitLog[]; viewMode: 'week' | 'month'
}) {
  const toggle   = useToggleHabitLog()
  const del      = useDeleteHabit()
  const today    = new Date().toISOString().split('T')[0]
  const todayLog = logs.find(l => l.habit_id === habit.id && l.date === today)
  const isDone   = !!todayLog

  return (
    <div className={`card px-4 py-3 transition-all duration-300 ${isDone ? 'opacity-75' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggle.mutate({ habitId: habit.id, date: today, isLogged: isDone, logId: todayLog?.id })}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            isDone
              ? 'bg-nido-sage border-nido-sage shadow-[0_2px_6px_-1px_rgba(122,148,96,0.45)]'
              : 'border-nido-linen hover:border-nido-sage'
          }`}
        >
          {isDone && (
            <svg viewBox="0 0 12 12" className="w-3 h-3 text-white animate-pop" fill="none" stroke="currentColor">
              <path d="M2 6l3 3 5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <span className={`flex-1 text-sm font-medium text-nido-ink transition-all duration-200 ${isDone ? 'line-through opacity-60' : ''}`}>
          {habit.name}
        </span>

        <StreakBadge habitId={habit.id} />

        <button onClick={() => del.mutate(habit.id)} className="text-nido-mist hover:text-nido-rose transition-colors">
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {viewMode === 'week'
        ? <WeeklyGrid habitId={habit.id} weekDates={weekDates} logs={logs} />
        : <MonthHeatmap habitId={habit.id} monthLogs={monthLogs} />
      }
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export function HabitosModule() {
  const weekDates = getWeekDates()
  const { data: habits = [], isLoading } = useHabits()
  const { data: logs = [] }              = useHabitLogs(weekDates)
  const { data: monthLogs = [] }         = useMonthHabitLogs()
  const addHabit = useAddHabit()

  const [showForm,  setShowForm]  = useState(false)
  const [newName,   setNewName]   = useState('')
  const [viewMode,  setViewMode]  = useState<'week' | 'month'>('week')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await addHabit.mutateAsync(newName.trim())
    setNewName('')
    setShowForm(false)
  }

  const today          = new Date().toISOString().split('T')[0]
  const completedToday = habits.filter(h => logs.some(l => l.habit_id === h.id && l.date === today)).length

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">🌿 Hábitos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-3">
          <PlusCircleIcon className="w-4 h-4" />
          <span>Nuevo</span>
        </button>
      </div>

      {habits.length > 0 && <ProgressBar completed={completedToday} total={habits.length} />}
      {habits.length > 0 && <MonthStats habitCount={habits.length} />}

      {/* View toggle */}
      {habits.length > 0 && (
        <div className="flex gap-2 mb-4">
          {(['week', 'month'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                viewMode === mode
                  ? 'bg-nido-sage text-white shadow-[0_2px_8px_-2px_rgba(122,148,96,0.4)]'
                  : 'bg-nido-linen text-nido-mauve'
              }`}>
              {mode === 'month' && <CalendarDotsIcon size={14} />}
              {mode === 'week' ? 'Esta semana' : '28 días'}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="card p-4 mb-4 flex gap-2 animate-slide-up">
          <input className="input flex-1" placeholder="Nombre del hábito" value={newName}
            onChange={e => setNewName(e.target.value)} autoFocus required />
          <button type="submit" disabled={addHabit.isPending} className="btn-primary px-4">Agregar</button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24" style={{ animationDelay: `${i * 100}ms` }} />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-nido-mauve text-sm">Sin hábitos aún</p>
          <p className="text-nido-mist text-xs mt-1">¡Agrega tu primer hábito!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit, i) => (
            <div key={habit.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <HabitRow habit={habit} weekDates={weekDates} logs={logs} monthLogs={monthLogs} viewMode={viewMode} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
