'use client'

import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useMoodLogs, useTodayMood, useUpsertMood } from '@/hooks/useHumor'

const MOODS = [
  { emoji: '😊', label: 'Bien',    value: 5, strip: 'bg-nido-sage',     ring: 'ring-nido-sage',     bg: 'bg-nido-sage-pale' },
  { emoji: '🙂', label: 'Regular', value: 4, strip: 'bg-nido-lavender', ring: 'ring-nido-lavender', bg: 'bg-nido-lavender-pale' },
  { emoji: '😐', label: 'Neutro',  value: 3, strip: 'bg-nido-mist',     ring: 'ring-nido-mist',     bg: 'bg-nido-linen' },
  { emoji: '😔', label: 'Bajo',    value: 2, strip: 'bg-nido-amber',    ring: 'ring-nido-amber',    bg: 'bg-nido-amber-pale' },
  { emoji: '😢', label: 'Difícil', value: 1, strip: 'bg-nido-rose',     ring: 'ring-nido-rose',     bg: 'bg-nido-rose-pale' },
]

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { emoji: string; label: string; date: string } }[] }) {
  if (!active || !payload?.[0]) return null
  const { emoji, label, date } = payload[0].payload
  return (
    <div className="card px-3 py-2 text-center">
      <p className="text-xl leading-none">{emoji}</p>
      <p className="text-[10px] font-medium text-nido-mauve mt-1">{label}</p>
      <p className="text-[9px] text-nido-mist mt-0.5">{date}</p>
    </div>
  )
}

// ─── Mood Stats ───────────────────────────────────────────────
function MoodStats({ history }: { history: { mood: string; date: string }[] }) {
  const thisMonth = new Date().toISOString().slice(0, 7)
  const monthLogs = history.filter(m => m.date.startsWith(thisMonth))

  const frequency = useMemo(() => {
    const counts: Record<string, number> = {}
    monthLogs.forEach(m => { counts[m.mood] = (counts[m.mood] ?? 0) + 1 })
    return counts
  }, [monthLogs])

  const topMood = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="grid grid-cols-2 gap-2.5 mb-5">
      <div className="card p-3 text-center animate-fade-up">
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Días registrados</p>
        <p className="text-xl font-bold text-nido-rose">{monthLogs.length}</p>
        <p className="text-[9px] text-nido-mist mt-0.5">este mes</p>
      </div>
      <div className="card p-3 text-center animate-fade-up" style={{ animationDelay: '60ms' }}>
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Más frecuente</p>
        {topMood ? (
          <>
            <p className="text-xl leading-none">{topMood[0]}</p>
            <p className="text-[9px] text-nido-mist mt-1">{topMood[1]}x este mes</p>
          </>
        ) : (
          <p className="text-xl leading-none text-nido-mist">—</p>
        )}
      </div>
    </div>
  )
}

// ─── Mood Trend Chart ─────────────────────────────────────────
function MoodChart({ history }: { history: { mood: string; date: string }[] }) {
  const chartData = useMemo(() => {
    return [...history].slice(0, 14).reverse().map(entry => {
      const moodCfg = MOODS.find(m => m.emoji === entry.mood)
      return {
        date: new Date(entry.date + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        value: moodCfg?.value ?? 3,
        emoji: entry.mood,
        label: moodCfg?.label ?? '',
      }
    })
  }, [history])

  if (chartData.length < 2) return null

  return (
    <div className="card p-4 mb-5 animate-fade-up">
      <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-3">
        Tendencia — últimos {chartData.length} días
      </p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#c0aa98', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={false} axisLine={false} tickLine={false} />
          <ReferenceLine y={3} stroke="#f4ede0" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#c4786a"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#c4786a', stroke: '#fdf9f2', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#c4786a', stroke: '#fdf9f2', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export function HumorModule() {
  const { data: todayMood }    = useTodayMood()
  const { data: history = [] } = useMoodLogs()
  const upsert = useUpsertMood()

  const today = new Date().toISOString().split('T')[0]
  const [selectedMood, setSelectedMood] = useState('')
  const [note,         setNote]         = useState('')
  const [saved,        setSaved]        = useState(false)

  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.mood)
      setNote(todayMood.note ?? '')
    }
  }, [todayMood])

  async function handleSave() {
    if (!selectedMood) return
    await upsert.mutateAsync({ mood: selectedMood, note, date: today })
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const historyFiltered = history.filter(m => m.date !== today)

  return (
    <div className="animate-fade-up">
      <div className="py-4">
        <h1 className="font-display text-2xl text-nido-ink">🌸 Humor</h1>
        <p className="text-xs text-nido-mist mt-0.5">¿Cómo te sientes hoy?</p>
      </div>

      {/* Selector de hoy */}
      <div className="card p-5 mb-5">
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist mb-1">
          Estado de hoy —{' '}
          <span className="text-nido-rose capitalize font-normal">
            {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </p>

        <div className="flex justify-between gap-1.5 my-4">
          {MOODS.map(m => {
            const isSelected = selectedMood === m.emoji
            return (
              <button
                key={m.emoji}
                onClick={() => setSelectedMood(m.emoji)}
                className={`
                  flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl
                  transition-all duration-200
                  ${isSelected
                    ? `${m.bg} ring-2 ${m.ring} scale-105 shadow-sm`
                    : 'bg-nido-linen hover:bg-nido-blush hover:scale-102'
                  }
                `}
              >
                <span className={`text-[1.75rem] leading-none transition-transform duration-200 ${isSelected ? 'animate-pop' : ''}`}>
                  {m.emoji}
                </span>
                <span className="text-[9px] font-medium text-nido-mauve">{m.label}</span>
              </button>
            )
          })}
        </div>

        <textarea
          className="input resize-none"
          placeholder="Escribe un pensamiento del día... (opcional)"
          rows={3}
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <button
          onClick={handleSave}
          disabled={!selectedMood || upsert.isPending}
          className="btn-primary w-full mt-3"
        >
          {saved ? '¡Guardado! ✓' : upsert.isPending ? 'Guardando...' : todayMood ? 'Actualizar estado' : 'Guardar estado'}
        </button>
      </div>

      {/* Stats */}
      {history.length > 0 && <MoodStats history={history} />}

      {/* Trend chart */}
      {historyFiltered.length > 1 && <MoodChart history={historyFiltered} />}

      {/* History */}
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist mb-3">
        Historial reciente
      </p>

      {historyFiltered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🌸</p>
          <p className="text-nido-mist text-sm">Sin registros anteriores</p>
        </div>
      ) : (
        <div className="space-y-2">
          {historyFiltered.map((entry, i) => {
            const moodCfg = MOODS.find(m => m.emoji === entry.mood)
            return (
              <div key={entry.id} className="card flex items-stretch overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}>
                <span className={`w-1.5 shrink-0 ${moodCfg?.strip ?? 'bg-nido-mist'}`} />
                <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0">{entry.mood}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-nido-mist capitalize">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${moodCfg?.bg ?? 'bg-nido-linen'}`}>
                        {moodCfg?.label}
                      </span>
                    </div>
                    {entry.note && <p className="text-sm text-nido-ink truncate mt-0.5">{entry.note}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
