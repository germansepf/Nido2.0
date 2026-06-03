'use client'

import { useState, useEffect } from 'react'
import { useMoodLogs, useTodayMood, useUpsertMood } from '@/hooks/useHumor'

const MOODS = [
  { emoji: '😊', label: 'Bien',    strip: 'bg-nido-sage',     ring: 'ring-nido-sage',     bg: 'bg-nido-sage-pale' },
  { emoji: '🙂', label: 'Regular', strip: 'bg-nido-lavender', ring: 'ring-nido-lavender', bg: 'bg-nido-lavender-pale' },
  { emoji: '😐', label: 'Neutro',  strip: 'bg-nido-mist',     ring: 'ring-nido-mist',     bg: 'bg-nido-linen' },
  { emoji: '😔', label: 'Bajo',    strip: 'bg-nido-amber',    ring: 'ring-nido-amber',    bg: 'bg-nido-amber-pale' },
  { emoji: '😢', label: 'Difícil', strip: 'bg-nido-rose',     ring: 'ring-nido-rose',     bg: 'bg-nido-rose-pale' },
]

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

  const historyFiltered = history.filter((m) => m.date !== today)
  const selectedConfig  = MOODS.find((m) => m.emoji === selectedMood)

  return (
    <div>
      {/* Header */}
      <div className="py-4">
        <h1 className="font-display text-2xl text-nido-ink">Humor</h1>
        <p className="text-xs text-nido-mist mt-0.5">¿Cómo te sientes hoy?</p>
      </div>

      {/* Mood selector card */}
      <div className="card p-5 mb-5">
        <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist mb-1">
          Estado de hoy —{' '}
          <span className="text-nido-rose capitalize font-normal">
            {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </p>

        {/* Emoji picker */}
        <div className="flex justify-between gap-1.5 my-4">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.emoji
            return (
              <button
                key={m.emoji}
                onClick={() => setSelectedMood(m.emoji)}
                className={`
                  flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl
                  transition-all duration-200
                  ${isSelected
                    ? `${m.bg} ring-2 ${m.ring} scale-105`
                    : 'bg-nido-linen hover:bg-nido-blush'
                  }
                `}
              >
                <span className="text-[1.75rem] leading-none">{m.emoji}</span>
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
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          onClick={handleSave}
          disabled={!selectedMood || upsert.isPending}
          className="btn-primary w-full mt-3"
          style={
            selectedConfig
              ? undefined
              : undefined
          }
        >
          {saved
            ? '¡Guardado! ✓'
            : upsert.isPending
            ? 'Guardando...'
            : 'Guardar estado'}
        </button>
      </div>

      {/* History */}
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist mb-3">
        Historial reciente
      </p>

      {historyFiltered.length === 0 ? (
        <p className="text-center text-nido-mist text-sm py-8">Sin registros anteriores</p>
      ) : (
        <div className="space-y-2">
          {historyFiltered.map((entry, i) => {
            const moodCfg = MOODS.find((m) => m.emoji === entry.mood)
            return (
              <div
                key={entry.id}
                className="card flex items-stretch overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Left strip in the mood color */}
                <span className={`w-1.5 shrink-0 ${moodCfg?.strip ?? 'bg-nido-mist'}`} />
                <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0">{entry.mood}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-nido-mist capitalize">
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('es', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    {entry.note && (
                      <p className="text-sm text-nido-ink truncate mt-0.5">{entry.note}</p>
                    )}
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
