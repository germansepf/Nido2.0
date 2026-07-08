'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { SignOutIcon, CalendarDotsIcon, TimerIcon, XIcon, PlayIcon, PauseIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useMonthSummary } from '@/hooks/useFinanzas'
import { useTasks, useEvents } from '@/hooks/useAgenda'
import { useHabits, useHabitLogs, getWeekDates } from '@/hooks/useHabitos'
import { useTodayMood, useMoodLogs } from '@/hooks/useHumor'
import { useTodaySleep, useUpsertSleep } from '@/hooks/useSueno'
import { useNotes } from '@/hooks/useNotas'

const MOOD_VALUES: Record<string, number> = {
  '😊': 5, '🙂': 4, '😐': 3, '😔': 2, '😢': 1,
}

const FRASES_POR_MOOD: Record<number, string[]> = {
  5: [
    'Qué bonito día te estás regalando 🌸',
    'Cuida esa energía, es tuya 💛',
    'Tu alegría también construye 🌿',
    'Brillas aunque no lo notes ✨',
    'Este es tu momento, disfrútalo 🌺',
  ],
  4: [
    'Un buen día de a poco 🌿',
    'Avanzar es suficiente 🐾',
    'Lo pequeño también importa 🍃',
    'Estás en el camino correcto 🌙',
    'Cada día suma, incluso los tranquilos 🌾',
  ],
  3: [
    'Los días neutros también construyen ✨',
    'No todo necesita ser intenso 🌫️',
    'La calma es una forma de poder 🕊️',
    'Hoy también vale 🌾',
    'A veces estar es suficiente 🌙',
  ],
  2: [
    'Está bien no estar bien 🫂',
    'Sé gentil contigo hoy 🌙',
    'Los días difíciles también pasan 🌧️',
    'Tu nido siempre está aquí 🪺',
    'Descansa, mañana es otra oportunidad 🌱',
  ],
  1: [
    'Tu nido siempre te sostiene 🤍',
    'Este momento también pasa 🌧️',
    'Mereces todo el cuidado del mundo 🫶',
    'Un día a la vez, sin prisa 🌱',
    'No estás sola, tu nido te abraza 🪺',
  ],
}

const FRASES_SUEÑO_MAL = [
  'Descansa cuando puedas, tu cuerpo lo necesita 🌙',
  'Un día cansado sigue siendo un día tuyo 🤍',
  'Sé gentil contigo, dormiste poco 🫂',
  'La energía vuelve, no te exijas de más hoy 🌿',
  'Incluso así, estás aquí. Eso vale 🪺',
]

const FRASES_SUEÑO_EXCELENTE = [
  'Descansaste bien, ¡qué regalo! Aprovecha esa energía 🌟',
  'Buen sueño, buen día. Lo construiste desde anoche ✨',
  'Tu cuerpo agradeció el descanso 🌸',
  'Empezar bien descansada lo cambia todo 🌤️',
  'Energía recargada, lista para brillar 💛',
]

const FRASES_GENERALES = [
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

const MOOD_GRADIENT: Record<number, string> = {
  5: 'linear-gradient(145deg, #dae8ce55 0%, transparent 65%)',
  4: 'linear-gradient(145deg, #ece7de55 0%, transparent 65%)',
  3: 'none',
  2: 'linear-gradient(145deg, #f0e4c055 0%, transparent 65%)',
  1: 'linear-gradient(145deg, #f0ddd655 0%, transparent 65%)',
}

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


// ─── Water Counter (localStorage) ────────────────────────────
function WaterCounter() {
  const today = new Date().toISOString().split('T')[0]
  const [glasses, setGlasses] = useState(() => {
    if (typeof window === 'undefined') return 0
    return parseInt(localStorage.getItem(`nido-agua-${today}`) ?? '0', 10)
  })

  function tap(i: number) {
    const next = glasses === i + 1 ? i : i + 1
    setGlasses(next)
    localStorage.setItem(`nido-agua-${today}`, String(next))
  }

  return (
    <div className="card px-4 py-3 mb-3 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist">Agua hoy</p>
        <span className="text-[10px] text-nido-mauve font-medium">{glasses}/4 vasos</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <button key={i} onClick={() => tap(i)}
            className={`flex-1 py-1.5 rounded-lg text-sm transition-all duration-200 ${
              i < glasses ? 'bg-blue-100 scale-95' : 'bg-nido-linen text-nido-mist/30'
            }`}
          >
            💧
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Sleep Question ───────────────────────────────────────────
function SleepQuestion() {
  const { data: todaySleep, isLoading } = useTodaySleep()
  const upsert = useUpsertSleep()
  const today  = new Date().toISOString().split('T')[0]

  if (isLoading || todaySleep) return null

  const opts = [
    { label: 'Muy bien', emoji: '😴', quality: 3 },
    { label: 'Bien',     emoji: '🙂', quality: 2 },
    { label: 'Mal',      emoji: '😩', quality: 1 },
  ]

  return (
    <div className="card px-4 py-3.5 mb-3 animate-fade-up">
      <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-2.5">¿Cómo dormiste?</p>
      <div className="flex gap-2">
        {opts.map(opt => (
          <button key={opt.quality}
            onClick={() => upsert.mutate({ date: today, quality: opt.quality })}
            disabled={upsert.isPending}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl bg-nido-linen hover:bg-nido-lavender-pale transition-all"
          >
            <span className="text-xl">{opt.emoji}</span>
            <span className="text-[9px] text-nido-mist">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Pomodoro Modal ───────────────────────────────────────────
type PomodoroPhase = 'work' | 'break'

function PomodoroModal({ onClose }: { onClose: () => void }) {
  const DURATIONS: Record<PomodoroPhase, number> = { work: 25 * 60, break: 5 * 60 }

  const [phase,    setPhase]    = useState<PomodoroPhase>('work')
  const [seconds,  setSeconds]  = useState(DURATIONS.work)
  const [running,  setRunning]  = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const notify = useCallback((title: string, body: string) => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' })
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') new Notification(title, { body })
      })
    }
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (phase === 'work') {
              notify('¡Buen trabajo! 🌿', '25 minutos completados. Tómate un descanso.')
              setPhase('break')
              setSeconds(DURATIONS.break)
            } else {
              notify('¡A retomar! ⏱️', 'Descanso terminado. Lista para seguir.')
              setPhase('work')
              setSeconds(DURATIONS.work)
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase, notify])

  function reset() {
    setRunning(false)
    setSeconds(DURATIONS[phase])
  }

  function switchPhase(p: PomodoroPhase) {
    setRunning(false)
    setPhase(p)
    setSeconds(DURATIONS[p])
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const pct  = ((DURATIONS[phase] - seconds) / DURATIONS[phase]) * 100
  const circumference = 2 * Math.PI * 52

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm card p-6 animate-slide-up" style={{ boxShadow: '0 -4px 40px -8px rgba(196,120,106,0.22)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">Pomodoro</p>
          <button onClick={onClose} className="text-nido-mist hover:text-nido-mauve"><XIcon size={18} /></button>
        </div>

        {/* Phase toggle */}
        <div className="flex gap-1.5 mb-6">
          {(['work', 'break'] as const).map(p => (
            <button key={p} onClick={() => switchPhase(p)}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                phase === p ? 'bg-nido-rose text-white' : 'bg-nido-linen text-nido-mauve'
              }`}>
              {p === 'work' ? '⏱️ Trabajo' : '☕ Descanso'}
            </button>
          ))}
        </div>

        {/* Circular timer */}
        <div className="flex justify-center mb-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f4ede0" strokeWidth="6" />
              <circle cx="60" cy="60" r="52" fill="none"
                stroke={phase === 'work' ? '#c4786a' : '#7a9460'}
                strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * pct / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl text-nido-ink leading-none">{mins}:{secs}</span>
              <span className="text-[9px] text-nido-mist mt-1">{phase === 'work' ? 'enfoque' : 'descanso'}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="p-3 rounded-full bg-nido-linen text-nido-mauve hover:bg-nido-rose-pale hover:text-nido-rose transition-all">
            <ArrowCounterClockwiseIcon size={20} />
          </button>
          <button onClick={() => setRunning(r => !r)}
            className="p-4 rounded-full bg-nido-rose text-white hover:bg-nido-rose-deep shadow-lg transition-all active:scale-95">
            {running ? <PauseIcon size={24} weight="fill" /> : <PlayIcon size={24} weight="fill" />}
          </button>
          <div className="w-12" />
        </div>
      </div>
    </div>
  )
}

const MODULES = [
  { href: '/finanzas', emoji: '💰', label: 'Finanzas', bgColor: 'bg-nido-rose-pale' },
  { href: '/agenda',   emoji: '🗓️', label: 'Agenda',   bgColor: 'bg-nido-lavender-pale' },
  { href: '/habitos',  emoji: '🌿', label: 'Hábitos',  bgColor: 'bg-nido-sage-pale' },
  { href: '/notas',    emoji: '📒', label: 'Notas',    bgColor: 'bg-nido-amber-pale' },
  { href: '/libros',   emoji: '📚', label: 'Libros',   bgColor: 'bg-nido-sage-pale' },
  { href: '/humor',    emoji: '🌸', label: 'Humor',    bgColor: 'bg-nido-rose-pale' },
]

export default function DashboardPage() {
  const router   = useRouter()
  const supabase = createClient()

  const userName = 'Majo'
  const [daysSince,      setDaysSince]      = useState<number | null>(null)
  const [showPomodoro,   setShowPomodoro]   = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.created_at) {
        setDaysSince(Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000) + 1)
      }
    })
  }, [])

  const month                    = getCurrentMonth()
  const summary                  = useMonthSummary(month)
  const { data: tasks = [] }     = useTasks()
  const { data: events = [] }    = useEvents()
  const weekDates                = getWeekDates()
  const { data: habits = [] }    = useHabits()
  const { data: habitLogs = [] } = useHabitLogs(weekDates)
  const { data: todayMood }      = useTodayMood()
  const { data: moodLogs = [] }  = useMoodLogs()

  const { data: notes = [] }    = useNotes()
  const { data: todaySleep }    = useTodaySleep()

  const today           = new Date().toISOString().split('T')[0]
  const unlockedToday   = notes.filter(n => n.tag === 'capsula' && n.unlock_date === today)
  const pendingToday    = tasks.filter(t => t.type === 'today' && !t.done).length
  const completedHabits = habits.filter(h => habitLogs.some(l => l.habit_id === h.id && l.date === today)).length
  const nextEvent       = events[0] ?? null

  const moodValue      = todayMood ? (MOOD_VALUES[todayMood.mood] ?? 3) : null
  const sleepQuality   = todaySleep?.quality ?? null
  const dayIdx         = new Date().getDate()

  const frase = (() => {
    // Sueño malo → override siempre, es lo más importante para el cuerpo
    if (sleepQuality === 1) return FRASES_SUEÑO_MAL[dayIdx % FRASES_SUEÑO_MAL.length]
    // Sueño excelente + humor positivo → frase energizante
    if (sleepQuality === 3 && moodValue !== null && moodValue >= 4) return FRASES_SUEÑO_EXCELENTE[dayIdx % FRASES_SUEÑO_EXCELENTE.length]
    // Normal: basado en humor
    if (moodValue !== null) { const arr = FRASES_POR_MOOD[moodValue]; return arr[dayIdx % arr.length] }
    // Sin datos: frase general del día
    return FRASES_GENERALES[dayIdx % FRASES_GENERALES.length]
  })()

  const headerGradient = moodValue !== null ? (MOOD_GRADIENT[moodValue] ?? 'none') : 'none'

  // Resumen semanal
  const daysElapsedThisWeek = weekDates.filter(d => d <= today).length
  const maxCompletions      = habits.length * daysElapsedThisWeek
  const weekHabitPercent    = maxCompletions > 0 ? Math.round((habitLogs.length / maxCompletions) * 100) : 0
  const weekMoods           = moodLogs.filter(m => weekDates.includes(m.date))
  const avgMoodValue        = weekMoods.length > 0
    ? weekMoods.reduce((s, m) => s + (MOOD_VALUES[m.mood] ?? 3), 0) / weekMoods.length
    : null
  const avgMoodEmoji        = avgMoodValue != null
    ? (['😢', '😔', '😐', '🙂', '😊'][Math.round(avgMoodValue) - 1] ?? '😐')
    : null

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div
        className="-mx-4 px-4 pt-8 pb-4 rounded-b-3xl transition-all duration-700"
        style={{ backgroundImage: headerGradient }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-nido-mist tracking-wider uppercase">
              {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="font-display text-[2rem] leading-tight text-nido-ink mt-0.5">
              {getGreeting(userName)}
            </h1>
            {daysSince !== null && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full mt-1 font-medium transition-all ${
                daysSince >= 100
                  ? 'bg-nido-rose-pale text-nido-rose-deep text-[10px]'
                  : daysSince >= 30
                  ? 'bg-nido-amber-pale text-nido-amber text-[10px]'
                  : daysSince >= 7
                  ? 'bg-nido-linen text-nido-amber text-[9.5px]'
                  : 'bg-nido-linen text-nido-mist text-[9.5px]'
              }`}>
                <span className={daysSince >= 7 ? 'animate-pop' : ''}>🔥</span>
                {daysSince}
                <span className="font-normal opacity-70">{daysSince === 1 ? 'día' : 'días'}</span>
              </span>
            )}
            {frase && (
              <p className="text-xs text-nido-mauve mt-1.5 italic animate-fade-up" style={{ animationDelay: '200ms' }}>
                {frase}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowPomodoro(true)} className="mt-1 p-2 rounded-xl text-nido-mist hover:text-nido-amber hover:bg-nido-amber-pale transition-all">
              <TimerIcon size={16} />
            </button>
            <button onClick={handleLogout} className="mt-1 p-2 rounded-xl text-nido-mist hover:text-nido-rose hover:bg-nido-rose-pale transition-all">
              <SignOutIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mood del día */}
      {todayMood && (
        <Link href="/humor"
          className="card card-lift px-4 py-3.5 mb-3 flex items-center gap-3.5 mt-4"
        >
          <span className="text-[2rem] leading-none shrink-0">{todayMood.mood}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-nido-mist mb-0.5">Hoy me siento</p>
            {todayMood.note
              ? <p className="text-sm text-nido-ink truncate">{todayMood.note}</p>
              : <p className="text-sm text-nido-mauve">Sin nota hoy</p>
            }
          </div>
          <span className="text-nido-mist shrink-0 text-base leading-none opacity-60">›</span>
        </Link>
      )}

      {/* Cápsulas desbloqueadas hoy */}
      {unlockedToday.map(n => (
        <Link key={n.id} href="/notas"
          className="card card-lift px-4 py-3.5 mb-3 flex items-center gap-3 animate-pop bg-nido-amber-pale border-nido-amber/30">
          <span className="text-2xl shrink-0">💌</span>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-nido-amber mb-0.5">Tu cápsula se abrió hoy</p>
            <p className="text-sm font-medium text-nido-ink truncate">{n.title}</p>
          </div>
          <span className="text-nido-amber shrink-0 text-base opacity-60">›</span>
        </Link>
      ))}

      {/* Sueño y agua */}
      <SleepQuestion />
      <WaterCounter />

      {/* Esta semana en tu nido */}
      {habits.length > 0 && (
        <div className="card px-4 py-3.5 mb-4 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-2.5">Esta semana en tu nido</p>
          <div className="flex items-center gap-2">
            <div className="text-center flex-1">
              <p className="text-[1.3rem] font-bold text-nido-sage-deep leading-none">{weekHabitPercent}%</p>
              <p className="text-[9px] text-nido-mist mt-0.5">hábitos</p>
            </div>
            <div className="w-px h-8 bg-nido-rose-pale" />
            <div className="text-center flex-1">
              <p className="text-[1.3rem] font-bold text-nido-ink leading-none">{weekMoods.length}</p>
              <p className="text-[9px] text-nido-mist mt-0.5">días reg.</p>
            </div>
            {avgMoodEmoji && (
              <>
                <div className="w-px h-8 bg-nido-rose-pale" />
                <div className="text-center flex-1">
                  <p className="text-[1.3rem] leading-none">{avgMoodEmoji}</p>
                  <p className="text-[9px] text-nido-mist mt-0.5">humor prom.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Próximo evento */}
      {nextEvent && (
        <Link href="/agenda"
          className="card card-lift px-4 py-3 mb-4 flex items-center gap-3 animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          <div className="w-9 h-9 rounded-xl bg-nido-sage-pale flex items-center justify-center shrink-0">
            <CalendarDotsIcon size={16} weight="duotone" className="text-nido-sage-deep" />
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

      {showPomodoro && <PomodoroModal onClose={() => setShowPomodoro(false)} />}

      {/* Módulos */}
      <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-nido-mist mb-3">Módulos</p>
      <div className="grid grid-cols-2 gap-2.5">
        {MODULES.map(({ href, emoji, label, bgColor }, i) => (
          <Link key={href} href={href}
            className="card card-lift p-4 flex items-center gap-3 group animate-fade-up"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor} transition-transform duration-200 group-hover:scale-110`}>
              <span className="text-xl leading-none">{emoji}</span>
            </div>
            <span className="text-sm font-medium text-nido-ink flex-1">{label}</span>
            <span className="text-base leading-none text-nido-mist opacity-0 group-hover:opacity-60 transition-opacity">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
