'use client'

import { useState } from 'react'
import { PlusCircle, Trash2, Flame } from 'lucide-react'
import {
  useHabits,
  useHabitLogs,
  useToggleHabitLog,
  useAddHabit,
  useDeleteHabit,
  useStreak,
  getWeekDates,
} from '@/hooks/useHabitos'
import type { Habit, HabitLog } from '@/lib/types'

const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// ─── Progress bar ─────────────────────────────────────────────
function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">
          Progreso de hoy
        </p>
        <span className="text-sm font-bold text-nido-sage-deep">
          {completed}
          <span className="text-nido-mist font-normal text-xs">/{total}</span>
        </span>
      </div>
      <div className="h-2 bg-nido-linen rounded-full overflow-hidden">
        <div
          className="h-full bg-nido-sage rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && (
        <p className="text-[10px] text-nido-sage-deep font-medium mt-1.5 text-center">
          ¡Todos los hábitos completados! 🌿
        </p>
      )}
    </div>
  )
}

// ─── Weekly Grid ──────────────────────────────────────────────
function WeeklyGrid({
  habitId,
  weekDates,
  logs,
}: {
  habitId: string
  weekDates: string[]
  logs: HabitLog[]
}) {
  const toggle = useToggleHabitLog()
  const today  = new Date().toISOString().split('T')[0]

  return (
    <div className="flex gap-1.5 mt-2.5">
      {weekDates.map((date, i) => {
        const log      = logs.find((l) => l.habit_id === habitId && l.date === date)
        const isToday  = date === today
        const isPast   = date <= today
        const isLogged = !!log

        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <span className="text-[8px] text-nido-mist font-medium">{DAY_NAMES[i]}</span>
            <button
              onClick={() =>
                isPast &&
                toggle.mutate({ habitId, date, isLogged, logId: log?.id })
              }
              disabled={!isPast}
              className={`w-6 h-6 rounded-full transition-all duration-200 ${
                isLogged
                  ? 'bg-nido-sage shadow-[0_2px_6px_-1px_rgba(107,171,126,0.4)]'
                  : isToday
                  ? 'border-2 border-nido-rose bg-transparent'
                  : isPast
                  ? 'bg-nido-linen'
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
      <Flame className="w-3.5 h-3.5" />
      {streak}
    </span>
  )
}

// ─── Habit Row ────────────────────────────────────────────────
function HabitRow({
  habit,
  weekDates,
  logs,
}: {
  habit: Habit
  weekDates: string[]
  logs: HabitLog[]
}) {
  const toggle   = useToggleHabitLog()
  const del      = useDeleteHabit()
  const today    = new Date().toISOString().split('T')[0]
  const todayLog = logs.find((l) => l.habit_id === habit.id && l.date === today)
  const isDone   = !!todayLog

  return (
    <div className="card px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Today checkbox */}
        <button
          onClick={() =>
            toggle.mutate({
              habitId: habit.id,
              date: today,
              isLogged: isDone,
              logId: todayLog?.id,
            })
          }
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            isDone
              ? 'bg-nido-sage border-nido-sage shadow-[0_2px_6px_-1px_rgba(107,171,126,0.45)]'
              : 'border-nido-linen hover:border-nido-sage'
          }`}
        >
          {isDone && (
            <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor">
              <path d="M2 6l3 3 5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <span className={`flex-1 text-sm font-medium text-nido-ink ${isDone ? 'line-through opacity-60' : ''}`}>
          {habit.name}
        </span>

        <StreakBadge habitId={habit.id} />

        <button
          onClick={() => del.mutate(habit.id)}
          className="text-nido-mist hover:text-nido-rose transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <WeeklyGrid habitId={habit.id} weekDates={weekDates} logs={logs} />
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export function HabitosModule() {
  const weekDates = getWeekDates()
  const { data: habits = [], isLoading } = useHabits()
  const { data: logs = [] }  = useHabitLogs(weekDates)
  const addHabit = useAddHabit()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName]   = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    await addHabit.mutateAsync(newName.trim())
    setNewName('')
    setShowForm(false)
  }

  const today          = new Date().toISOString().split('T')[0]
  const completedToday = habits.filter((h) =>
    logs.some((l) => l.habit_id === h.id && l.date === today)
  ).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">Hábitos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary py-2 px-3"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Progress bar — only when there are habits */}
      {habits.length > 0 && (
        <ProgressBar completed={completedToday} total={habits.length} />
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="card p-4 mb-4 flex gap-2 animate-scale-in">
          <input
            className="input flex-1"
            placeholder="Nombre del hábito"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" disabled={addHabit.isPending} className="btn-primary px-4">
            Agregar
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-nido-mist text-sm">Cargando...</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-nido-mauve text-sm">Sin hábitos aún</p>
          <p className="text-nido-mist text-xs mt-1">¡Agrega tu primer hábito!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit, i) => (
            <div key={habit.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <HabitRow habit={habit} weekDates={weekDates} logs={logs} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
