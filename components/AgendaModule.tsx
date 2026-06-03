'use client'

import { useState } from 'react'
import { PlusCircle, Trash2, Check, Clock, CalendarPlus } from 'lucide-react'
import {
  useTasks,
  useEvents,
  useAddTask,
  useToggleTask,
  useDeleteTask,
  useAddEvent,
  useDeleteEvent,
} from '@/hooks/useAgenda'
import type { Task, TaskType } from '@/lib/types'

// ─── Section header ───────────────────────────────────────────
function SectionHeader({
  label,
  accent,
  onAdd,
}: {
  label: string
  accent: string
  onAdd: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2">
        <span className={`block w-0.5 h-4 rounded-full ${accent}`} />
        <h2 className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mauve">
          {label}
        </h2>
      </div>
      <button
        onClick={onAdd}
        className="text-[11px] font-medium text-nido-mist hover:text-nido-rose transition-colors"
      >
        + agregar
      </button>
    </div>
  )
}

// ─── Task Item ────────────────────────────────────────────────
function TaskItem({ task, accentColor }: { task: Task; accentColor: string }) {
  const toggle = useToggleTask()
  const del = useDeleteTask()

  return (
    <div
      className={`card flex items-stretch overflow-hidden transition-opacity ${
        task.done ? 'opacity-55' : ''
      }`}
    >
      <span className={`w-1 shrink-0 ${task.done ? 'bg-nido-mist' : accentColor}`} />
      <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
        <button
          onClick={() => toggle.mutate({ id: task.id, done: !task.done })}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            task.done
              ? 'bg-nido-rose border-nido-rose'
              : 'border-nido-rose-pale hover:border-nido-rose'
          }`}
        >
          {task.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm text-nido-ink ${task.done ? 'line-through' : ''}`}>
            {task.text}
          </p>
          {task.time && (
            <p className="text-xs text-nido-mist flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {task.time}
            </p>
          )}
        </div>

        <button
          onClick={() => del.mutate(task.id)}
          className="text-nido-mist hover:text-nido-rose transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Task Form ────────────────────────────────────────────────
function TaskForm({ defaultType, onClose }: { defaultType: TaskType; onClose: () => void }) {
  const add = useAddTask()
  const [text, setText] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState<TaskType>(defaultType)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await add.mutateAsync({ text, time: time || undefined, type })
    setText('')
    setTime('')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-3 space-y-3 animate-scale-in">
      <div className="flex gap-2">
        {(['today', 'pending'] as TaskType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
              type === t
                ? 'bg-nido-rose text-white shadow-[0_2px_8px_-2px_rgba(220,107,132,0.4)]'
                : 'bg-nido-linen text-nido-mauve'
            }`}
          >
            {t === 'today' ? 'Hoy' : 'Pendiente'}
          </button>
        ))}
      </div>

      <input
        className="input"
        placeholder="Descripción de la tarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        autoFocus
      />

      {type === 'today' && (
        <input
          className="input"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      )}

      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={add.isPending} className="btn-primary flex-1">Agregar</button>
      </div>
    </form>
  )
}

// ─── Event Form ───────────────────────────────────────────────
function EventForm({ onClose }: { onClose: () => void }) {
  const add = useAddEvent()
  const [text, setText] = useState('')
  const [date, setDate] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !date) return
    await add.mutateAsync({ text, date })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-3 space-y-3 animate-scale-in">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">
        Nuevo evento
      </p>
      <input
        className="input"
        placeholder="Descripción del evento"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        autoFocus
      />
      <input
        className="input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={add.isPending} className="btn-primary flex-1">Agregar</button>
      </div>
    </form>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export function AgendaModule() {
  const { data: tasks = [], isLoading } = useTasks()
  const { data: events = [] } = useEvents()
  const del = useDeleteEvent()

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [taskFormType, setTaskFormType] = useState<TaskType>('today')

  const todayTasks   = tasks.filter((t) => t.type === 'today')
  const pendingTasks = tasks.filter((t) => t.type === 'pending')

  function openTaskForm(type: TaskType) {
    setTaskFormType(type)
    setShowTaskForm(true)
    setShowEventForm(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">Agenda</h1>
        <div className="flex gap-2">
          <button
            onClick={() => openTaskForm('today')}
            className="btn-primary py-2 px-3"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-xs">Tarea</span>
          </button>
          <button
            onClick={() => { setShowEventForm(!showEventForm); setShowTaskForm(false) }}
            className="btn-secondary py-2 px-3"
          >
            <CalendarPlus className="w-4 h-4" />
            <span className="text-xs">Evento</span>
          </button>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm defaultType={taskFormType} onClose={() => setShowTaskForm(false)} />
      )}
      {showEventForm && <EventForm onClose={() => setShowEventForm(false)} />}

      {isLoading ? (
        <div className="text-center py-10 text-nido-mist text-sm">Cargando...</div>
      ) : (
        <>
          {/* Hoy */}
          <section className="mb-5">
            <SectionHeader
              label="Hoy"
              accent="bg-nido-rose"
              onAdd={() => openTaskForm('today')}
            />
            {todayTasks.length === 0 ? (
              <p className="text-sm text-nido-mist py-3 text-center">Sin tareas para hoy</p>
            ) : (
              <div className="space-y-2">
                {todayTasks.map((t, i) => (
                  <div key={t.id} className="animate-fade-up" style={{ animationDelay: `${i * 45}ms` }}>
                    <TaskItem task={t} accentColor="bg-nido-rose" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pendientes */}
          <section className="mb-5">
            <SectionHeader
              label="Pendientes"
              accent="bg-nido-lavender"
              onAdd={() => openTaskForm('pending')}
            />
            {pendingTasks.length === 0 ? (
              <p className="text-sm text-nido-mist py-3 text-center">Sin pendientes</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((t, i) => (
                  <div key={t.id} className="animate-fade-up" style={{ animationDelay: `${i * 45}ms` }}>
                    <TaskItem task={t} accentColor="bg-nido-lavender" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Próximos eventos */}
          <section>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="block w-0.5 h-4 rounded-full bg-nido-sage" />
              <h2 className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mauve">
                Próximos eventos
              </h2>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-nido-mist py-3 text-center">Sin eventos</p>
            ) : (
              <div className="space-y-2">
                {events.map((ev, i) => (
                  <div
                    key={ev.id}
                    className="card flex items-stretch overflow-hidden animate-fade-up"
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    <span className="w-1 shrink-0 bg-nido-sage" />
                    <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
                      <div className="w-10 text-center shrink-0">
                        <p className="text-lg font-bold text-nido-sage-deep leading-none">
                          {new Date(ev.date + 'T12:00:00').getDate()}
                        </p>
                        <p className="text-[9px] text-nido-mist uppercase mt-0.5">
                          {new Date(ev.date + 'T12:00:00').toLocaleDateString('es', { month: 'short' })}
                        </p>
                      </div>
                      <p className="flex-1 text-sm text-nido-ink">{ev.text}</p>
                      <button
                        onClick={() => del.mutate(ev.id)}
                        className="text-nido-mist hover:text-nido-rose transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
