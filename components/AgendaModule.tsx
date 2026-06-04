'use client'

import { useState } from 'react'
import { PlusCircleIcon, TrashIcon, CheckIcon, ClockIcon, CalendarPlusIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'
import {
  useTasks, useEvents, useAddTask, useToggleTask, useDeleteTask, useAddEvent, useDeleteEvent,
} from '@/hooks/useAgenda'
import type { Task, TaskType } from '@/lib/types'

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T12:00:00')
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function SectionHeader({ label, accent, count, onAdd }: { label: string; accent: string; count?: number; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2">
        <span className={`block w-0.5 h-4 rounded-full ${accent}`} />
        <h2 className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mauve">{label}</h2>
        {count !== undefined && count > 0 && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${accent} text-white`}>{count}</span>
        )}
      </div>
      <button onClick={onAdd} className="text-[11px] font-medium text-nido-mist hover:text-nido-rose transition-colors">
        + agregar
      </button>
    </div>
  )
}

function TaskItem({ task, accentColor }: { task: Task; accentColor: string }) {
  const toggle = useToggleTask()
  const del    = useDeleteTask()

  return (
    <div className={`card flex items-stretch overflow-hidden transition-all duration-300 ${task.done ? 'opacity-50' : ''}`}>
      <span className={`w-1 shrink-0 transition-colors duration-300 ${task.done ? 'bg-nido-mist' : accentColor}`} />
      <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
        <button
          onClick={() => toggle.mutate({ id: task.id, done: !task.done })}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            task.done
              ? 'bg-nido-sage border-nido-sage shadow-[0_1px_4px_rgba(122,148,96,0.3)]'
              : 'border-nido-rose-pale hover:border-nido-rose'
          }`}
        >
          {task.done && <CheckIcon size={12} weight="bold" color="white" className="animate-pop" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm text-nido-ink transition-all duration-200 ${task.done ? 'line-through text-nido-mist' : ''}`}>
            {task.text}
          </p>
          {task.time && (
            <p className="text-xs text-nido-mist flex items-center gap-1 mt-0.5">
              <ClockIcon size={12} />{task.time}
            </p>
          )}
        </div>

        <button onClick={() => del.mutate(task.id)} className="text-nido-mist hover:text-nido-rose transition-colors shrink-0">
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

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
    <form onSubmit={handleSubmit} className="card p-4 mb-3 space-y-3 animate-slide-up">
      <div className="flex gap-2">
        {(['today', 'pending'] as TaskType[]).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
              type === t
                ? 'bg-nido-rose text-white shadow-[0_2px_8px_-2px_rgba(196,120,106,0.4)]'
                : 'bg-nido-linen text-nido-mauve'
            }`}>
            {t === 'today' ? 'Hoy' : 'Pendiente'}
          </button>
        ))}
      </div>
      <input className="input" placeholder="Descripción de la tarea" value={text}
        onChange={e => setText(e.target.value)} required autoFocus />
      {type === 'today' && (
        <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
      )}
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={add.isPending} className="btn-primary flex-1">Agregar</button>
      </div>
    </form>
  )
}

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
    <form onSubmit={handleSubmit} className="card p-4 mb-3 space-y-3 animate-slide-up">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">Nuevo evento</p>
      <input className="input" placeholder="Descripción del evento" value={text}
        onChange={e => setText(e.target.value)} required autoFocus />
      <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={add.isPending} className="btn-primary flex-1">Agregar</button>
      </div>
    </form>
  )
}

export function AgendaModule() {
  const { data: tasks = [], isLoading } = useTasks()
  const { data: events = [] } = useEvents()
  const del = useDeleteEvent()

  const [showTaskForm,  setShowTaskForm]  = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [taskFormType,  setTaskFormType]  = useState<TaskType>('today')
  const [showDone,      setShowDone]      = useState(false)

  const todayTasks   = tasks.filter(t => t.type === 'today')
  const pendingTasks = tasks.filter(t => t.type === 'pending')
  const doneTasks    = tasks.filter(t => t.done)

  const visibleToday   = showDone ? todayTasks   : todayTasks.filter(t => !t.done)
  const visiblePending = showDone ? pendingTasks : pendingTasks.filter(t => !t.done)

  function openTaskForm(type: TaskType) {
    setTaskFormType(type)
    setShowTaskForm(true)
    setShowEventForm(false)
  }

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">🗓️ Agenda</h1>
        <div className="flex gap-2">
          <button onClick={() => openTaskForm('today')} className="btn-primary py-2 px-3">
            <PlusCircleIcon className="w-4 h-4" />
            <span className="text-xs">Tarea</span>
          </button>
          <button onClick={() => { setShowEventForm(!showEventForm); setShowTaskForm(false) }} className="btn-secondary py-2 px-3">
            <CalendarPlusIcon className="w-4 h-4" />
            <span className="text-xs">Evento</span>
          </button>
        </div>
      </div>

      {showTaskForm  && <TaskForm  defaultType={taskFormType} onClose={() => setShowTaskForm(false)} />}
      {showEventForm && <EventForm onClose={() => setShowEventForm(false)} />}

      {/* Show/hide completed toggle */}
      {doneTasks.length > 0 && (
        <button
          onClick={() => setShowDone(!showDone)}
          className="flex items-center gap-1.5 text-[10px] text-nido-mist hover:text-nido-mauve transition-colors mb-4"
        >
          {showDone ? <EyeSlashIcon size={14} /> : <EyeIcon size={14} />}
          {showDone ? 'Ocultar' : 'Mostrar'} completadas ({doneTasks.length})
        </button>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="skeleton h-14" style={{ animationDelay: `${i * 80}ms` }} />)}
        </div>
      ) : (
        <>
          {/* Hoy */}
          <section className="mb-5">
            <SectionHeader
              label="Hoy"
              accent="bg-nido-rose"
              count={todayTasks.filter(t => !t.done).length}
              onAdd={() => openTaskForm('today')}
            />
            {visibleToday.length === 0 ? (
              <p className="text-sm text-nido-mist py-3 text-center">
                {todayTasks.length > 0 ? '¡Todo listo por hoy! ✓' : 'Sin tareas para hoy'}
              </p>
            ) : (
              <div className="space-y-2">
                {visibleToday.map((t, i) => (
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
              count={pendingTasks.filter(t => !t.done).length}
              onAdd={() => openTaskForm('pending')}
            />
            {visiblePending.length === 0 ? (
              <p className="text-sm text-nido-mist py-3 text-center">Sin pendientes</p>
            ) : (
              <div className="space-y-2">
                {visiblePending.map((t, i) => (
                  <div key={t.id} className="animate-fade-up" style={{ animationDelay: `${i * 45}ms` }}>
                    <TaskItem task={t} accentColor="bg-nido-lavender" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Próximos eventos */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="block w-0.5 h-4 rounded-full bg-nido-sage" />
                <h2 className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mauve">
                  Próximos eventos
                </h2>
              </div>
              <button
                onClick={() => { setShowEventForm(!showEventForm); setShowTaskForm(false) }}
                className="text-[11px] font-medium text-nido-mist hover:text-nido-rose transition-colors"
              >
                + agregar
              </button>
            </div>

            {events.length === 0 ? (
              <p className="text-sm text-nido-mist py-3 text-center">Sin eventos</p>
            ) : (
              <div className="space-y-2">
                {events.map((ev, i) => {
                  const days = daysUntil(ev.date)
                  return (
                    <div key={ev.id} className="card-lift card flex items-stretch overflow-hidden animate-fade-up"
                      style={{ animationDelay: `${i * 45}ms` }}>
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
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${
                          days === 0
                            ? 'bg-nido-rose-pale text-nido-rose-deep'
                            : days <= 3
                            ? 'bg-nido-amber-pale text-nido-amber'
                            : 'bg-nido-linen text-nido-mauve'
                        }`}>
                          {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `${days}d`}
                        </span>
                        <button onClick={() => del.mutate(ev.id)} className="text-nido-mist hover:text-nido-rose transition-colors shrink-0">
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
