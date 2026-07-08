'use client'

import { useState, useEffect } from 'react'
import { TrashIcon, FlameIcon, CalendarDotsIcon, BellIcon, BellSlashIcon } from '@phosphor-icons/react'
import {
  useHabits, useHabitLogs, useMonthHabitLogs, useToggleHabitLog,
  useAddHabit, useDeleteHabit, useStreak, useUpdateHabitLog,
  getWeekDates, getLast28Dates,
} from '@/hooks/useHabitos'
import type { Habit, HabitLog } from '@/lib/types'
import { EmojiPickerButton } from '@/components/EmojiPickerButton'

const DEFAULT_HABIT_EMOJI = '🌱'

function loadHabitEmojis(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('nido-habit-emojis') ?? '{}') } catch { return {} }
}

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

  const cfg =
    streak >= 30 ? { icon: '👑', color: 'text-nido-rose'      } :
    streak >= 21 ? { icon: '🌸', color: 'text-nido-sage-deep' } :
    streak >= 7  ? { icon: '🎉', color: 'text-nido-amber'     } :
                   { icon: null,  color: 'text-nido-amber'     }

  return (
    <span className={`flex items-center gap-0.5 text-xs font-bold ${cfg.color}`}>
      {cfg.icon
        ? <span className={streak >= 7 ? 'animate-pop' : ''}>{cfg.icon}</span>
        : <FlameIcon size={14} weight="duotone" />
      }
      <span>{streak}</span>
    </span>
  )
}

// ─── Habit Row ────────────────────────────────────────────────
function HabitRow({ habit, weekDates, logs, monthLogs, viewMode, emoji, onEmojiChange }: {
  habit: Habit; weekDates: string[]; logs: HabitLog[]; monthLogs: HabitLog[]; viewMode: 'week' | 'month'
  emoji: string; onEmojiChange: (e: string) => void
}) {
  const toggle    = useToggleHabitLog()
  const del       = useDeleteHabit()
  const updateLog = useUpdateHabitLog()
  const today     = new Date().toISOString().split('T')[0]
  const todayLog  = logs.find(l => l.habit_id === habit.id && l.date === today)
  const isDone    = !!todayLog

  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [pages,    setPages]    = useState<number | ''>('')

  const isLectura = habit.name.toLowerCase().includes('lectura') || emoji === '📚'

  useEffect(() => {
    if (todayLog) {
      setNoteText(todayLog.note ?? '')
      setPages(todayLog.count && todayLog.count > 0 ? todayLog.count : '')
    } else {
      setNoteText('')
      setPages('')
      setShowNote(false)
    }
  }, [todayLog?.id])

  function handleSaveLog() {
    if (!todayLog?.id) return
    updateLog.mutate({
      id: todayLog.id,
      note: noteText || null,
      count: isLectura ? (typeof pages === 'number' ? pages : null) : undefined,
    })
  }

  return (
    <div className={`card px-4 py-3 transition-all duration-300 ${isDone ? 'opacity-80' : ''}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggle.mutate({ habitId: habit.id, date: today, isLogged: isDone, logId: todayLog?.id })}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            isDone
              ? 'bg-nido-sage border-nido-sage shadow-[0_2px_6px_-1px_rgba(122,148,96,0.45)]'
              : 'border-nido-linen hover:border-nido-sage'
          }`}
        >
          {isDone && (
            <svg viewBox="0 0 12 12" className="w-3.5 h-3.5 text-white animate-pop" fill="none" stroke="currentColor">
              <path d="M2 6l3 3 5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <EmojiPickerButton emoji={emoji} onSelect={onEmojiChange} size={20} />

        <span className={`flex-1 text-sm font-medium text-nido-ink transition-all duration-200 ${isDone ? 'line-through opacity-50' : ''}`}>
          {habit.name}
        </span>

        <StreakBadge habitId={habit.id} />

        <button onClick={() => del.mutate(habit.id)} className="text-nido-mist hover:text-nido-rose transition-colors">
          <TrashIcon size={14} />
        </button>
      </div>

      {/* Páginas leídas (solo hábitos de lectura) */}
      {isDone && isLectura && todayLog?.id && (
        <div className="flex items-center gap-2 mt-2 animate-fade-up">
          <span className="text-[10px] text-nido-mist">📄 Páginas hoy:</span>
          <input
            type="number"
            min={0}
            value={pages}
            onChange={e => setPages(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={handleSaveLog}
            placeholder="0"
            className="w-16 text-xs text-center border border-nido-rose-pale rounded-lg px-2 py-1 bg-nido-cream focus:outline-none focus:border-nido-rose transition-colors"
          />
          {typeof pages === 'number' && pages > 0 && (
            <span className="text-[10px] text-nido-sage-deep">¡{pages} páginas! 📚</span>
          )}
        </div>
      )}

      {/* Micro-nota */}
      {isDone && todayLog?.id && (
        <div className="mt-2 animate-fade-up">
          {!showNote && !noteText ? (
            <button
              onClick={() => setShowNote(true)}
              className="text-[10px] text-nido-mist hover:text-nido-mauve transition-colors"
            >
              📝 Agregar nota del día...
            </button>
          ) : (
            <textarea
              className="w-full text-xs text-nido-ink bg-nido-linen/60 border border-nido-rose-pale/50 rounded-xl px-2.5 py-1.5 resize-none focus:outline-none focus:border-nido-rose/50 transition-colors placeholder:text-nido-mist"
              placeholder="¿Cómo fue hoy este hábito?"
              rows={2}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onBlur={handleSaveLog}
              autoFocus={showNote && !noteText}
            />
          )}
        </div>
      )}

      {viewMode === 'week'
        ? <WeeklyGrid habitId={habit.id} weekDates={weekDates} logs={logs} />
        : <MonthHeatmap habitId={habit.id} monthLogs={monthLogs} />
      }
    </div>
  )
}

// ─── Habit Reminder ───────────────────────────────────────────
function HabitReminder({ completedToday, total }: { completedToday: number; total: number }) {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [reminderTime, setReminderTime] = useState(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('nido-reminder-time') ?? '') : ''
  )
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    if (permission !== 'granted' || !reminderTime || total === 0 || completedToday >= total) return
    const [hh, mm] = reminderTime.split(':').map(Number)
    const now = new Date()
    const fire = new Date()
    fire.setHours(hh, mm, 0, 0)
    const key = `nido-reminder-sent-${now.toISOString().split('T')[0]}`
    if (now >= fire && !localStorage.getItem(key)) {
      localStorage.setItem(key, '1')
      new Notification('¡Hoy faltan hábitos! 🌿', {
        body: `Llevas ${completedToday} de ${total} hábitos completados.`,
        icon: '/icon-192.png',
      })
    }
  }, [permission, reminderTime, completedToday, total])

  async function requestPermission() {
    const p = await Notification.requestPermission()
    setPermission(p)
    if (p === 'granted') setShowConfig(true)
  }

  function saveTime(t: string) {
    setReminderTime(t)
    localStorage.setItem('nido-reminder-time', t)
    setShowConfig(false)
  }

  function clearReminder() {
    setReminderTime('')
    localStorage.removeItem('nido-reminder-time')
  }

  if (typeof Notification === 'undefined') return null

  return (
    <div className="mb-4">
      {permission !== 'granted' ? (
        <button onClick={requestPermission}
          className="w-full card p-3 flex items-center gap-2 text-nido-mist hover:text-nido-amber transition-colors text-xs">
          <BellIcon size={14} />
          Activar recordatorio de hábitos
        </button>
      ) : reminderTime && !showConfig ? (
        <div className="flex items-center justify-between card p-2.5 px-3">
          <div className="flex items-center gap-2 text-[10px] text-nido-mist">
            <BellIcon size={13} className="text-nido-amber" />
            Recordatorio a las {reminderTime}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowConfig(true)} className="text-[9px] text-nido-mist hover:text-nido-mauve">editar</button>
            <button onClick={clearReminder} className="text-[9px] text-nido-mist hover:text-nido-rose"><BellSlashIcon size={12} /></button>
          </div>
        </div>
      ) : (
        <div className="card p-3 flex items-center gap-2 animate-fade-up">
          <BellIcon size={14} className="text-nido-amber shrink-0" />
          <input type="time" className="input flex-1 py-1 text-xs"
            defaultValue={reminderTime}
            onChange={e => saveTime(e.target.value)} />
          <button onClick={() => setShowConfig(false)} className="text-nido-mist text-xs">✕</button>
        </div>
      )}
    </div>
  )
}

// ─── Garden View ──────────────────────────────────────────────
function GardenPlant({ habitId, name, emoji }: { habitId: string; name: string; emoji: string }) {
  const { data: streak = 0 } = useStreak(habitId)
  const plant = streak >= 30 ? '🌳' : streak >= 21 ? '🌸' : streak >= 7 ? '🌿' : '🌱'
  const label = streak >= 30 ? 'Árbol' : streak >= 21 ? 'Flor' : streak >= 7 ? 'Brote' : 'Semilla'
  const bg    = streak >= 30 ? 'bg-nido-sage-pale border-nido-sage/40' :
                streak >= 21 ? 'bg-nido-rose-pale border-nido-rose/30' :
                streak >= 7  ? 'bg-nido-linen border-nido-sage/20' : 'bg-nido-linen border-nido-linen'

  return (
    <div className={`card p-4 flex flex-col items-center gap-2 border ${bg} transition-all duration-500`}>
      <div className="text-4xl leading-none animate-float">{plant}</div>
      <div className="text-center min-w-0 w-full">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <span className="text-sm">{emoji}</span>
        </div>
        <p className="text-[10px] font-medium text-nido-ink truncate">{name}</p>
        <p className="text-[8.5px] text-nido-mist mt-0.5">{label} · {streak}d</p>
      </div>
    </div>
  )
}

function GardenView({ habits, habitEmojis }: { habits: Habit[]; habitEmojis: Record<string, string> }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {habits.map((habit, i) => (
          <div key={habit.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <GardenPlant
              habitId={habit.id}
              name={habit.name}
              emoji={habitEmojis[habit.id] ?? DEFAULT_HABIT_EMOJI}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 card p-3 bg-nido-linen/60">
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-2">Crecimiento</p>
        <div className="grid grid-cols-4 gap-1 text-center">
          {[['🌱','Semilla','0d'],['🌿','Brote','7d'],['🌸','Flor','21d'],['🌳','Árbol','30d']].map(([icon,name,days]) => (
            <div key={name}>
              <div className="text-xl">{icon}</div>
              <p className="text-[7.5px] font-medium text-nido-ink mt-0.5">{name}</p>
              <p className="text-[7px] text-nido-mist">{days}</p>
            </div>
          ))}
        </div>
      </div>
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

  const [showForm,     setShowForm]    = useState(false)
  const [newName,      setNewName]     = useState('')
  const [newEmoji,     setNewEmoji]    = useState(DEFAULT_HABIT_EMOJI)
  const [viewMode,     setViewMode]    = useState<'week' | 'month' | 'jardin'>('week')
  const [habitEmojis,  setHabitEmojis] = useState<Record<string, string>>(loadHabitEmojis)

  function saveHabitEmoji(habitId: string, emoji: string) {
    const updated = { ...habitEmojis, [habitId]: emoji }
    setHabitEmojis(updated)
    localStorage.setItem('nido-habit-emojis', JSON.stringify(updated))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const habit = await addHabit.mutateAsync(newName.trim())
    if (habit) saveHabitEmoji(habit.id, newEmoji)
    setNewName('')
    setNewEmoji(DEFAULT_HABIT_EMOJI)
    setShowForm(false)
  }

  const today          = new Date().toISOString().split('T')[0]
  const completedToday = habits.filter(h => logs.some(l => l.habit_id === h.id && l.date === today)).length

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">🌿 Hábitos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-3">
          <span className="text-base leading-none">✦</span>
          <span>Nuevo</span>
        </button>
      </div>

      {habits.length > 0 && <ProgressBar completed={completedToday} total={habits.length} />}
      {habits.length > 0 && <MonthStats habitCount={habits.length} />}
      {habits.length > 0 && <HabitReminder completedToday={completedToday} total={habits.length} />}

      {/* View toggle */}
      {habits.length > 0 && (
        <div className="flex gap-1.5 mb-4">
          {([
            { key: 'week',   label: 'Semana' },
            { key: 'month',  label: '28 días' },
            { key: 'jardin', label: '🌱 Jardín' },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setViewMode(key)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                viewMode === key
                  ? 'bg-nido-sage text-white shadow-[0_2px_8px_-2px_rgba(122,148,96,0.4)]'
                  : 'bg-nido-linen text-nido-mauve'
              }`}>
              {key === 'month' && <CalendarDotsIcon size={12} />}
              {label}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="card p-4 mb-4 space-y-3 animate-slide-up">
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">Nuevo hábito</p>
          <div className="flex items-center gap-3">
            <EmojiPickerButton emoji={newEmoji} onSelect={setNewEmoji} size={26} />
            <input className="input flex-1" placeholder="Nombre del hábito" value={newName}
              onChange={e => setNewName(e.target.value)} autoFocus required />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={addHabit.isPending} className="btn-primary flex-1">Agregar</button>
          </div>
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
      ) : viewMode === 'jardin' ? (
        <GardenView habits={habits} habitEmojis={habitEmojis} />
      ) : (
        <div className="space-y-2">
          {habits.map((habit, i) => (
            <div key={habit.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <HabitRow habit={habit} weekDates={weekDates} logs={logs} monthLogs={monthLogs} viewMode={viewMode}
                emoji={habitEmojis[habit.id] ?? DEFAULT_HABIT_EMOJI}
                onEmojiChange={(e) => saveHabitEmoji(habit.id, e)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
