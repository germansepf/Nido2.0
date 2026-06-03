'use client'

import { useState } from 'react'
import { PlusCircle, Trash2, X } from 'lucide-react'
import { useNotes, useAddNote, useDeleteNote } from '@/hooks/useNotas'
import type { NoteTag } from '@/lib/types'

const TAG_CONFIG: Record<
  NoteTag,
  { label: string; strip: string; chipBg: string; chipText: string }
> = {
  personal: {
    label:    'Personal',
    strip:    'bg-nido-rose',
    chipBg:   'bg-nido-rose-pale',
    chipText: 'text-nido-rose-deep',
  },
  trabajo: {
    label:    'Trabajo',
    strip:    'bg-nido-lavender',
    chipBg:   'bg-nido-lavender-pale',
    chipText: 'text-nido-lavender-deep',
  },
  ideas: {
    label:    'Ideas',
    strip:    'bg-nido-amber',
    chipBg:   'bg-nido-amber-pale',
    chipText: 'text-nido-amber',
  },
  salud: {
    label:    'Salud',
    strip:    'bg-nido-sage',
    chipBg:   'bg-nido-sage-pale',
    chipText: 'text-nido-sage-deep',
  },
}

const ALL_TAGS = Object.keys(TAG_CONFIG) as NoteTag[]

// ─── Note Card ────────────────────────────────────────────────
function NoteCard({
  note,
  delay,
}: {
  note: { id: string; title: string; body: string | null; tag: NoteTag; created_at: string }
  delay: number
}) {
  const del = useDeleteNote()
  const cfg = TAG_CONFIG[note.tag]

  return (
    <div
      className="card flex items-stretch overflow-hidden animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Left color strip */}
      <span className={`w-1.5 shrink-0 ${cfg.strip}`} />

      <div className="flex-1 min-w-0 p-4">
        {/* Tag chip */}
        <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2 ${cfg.chipBg} ${cfg.chipText}`}>
          {cfg.label}
        </span>

        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-nido-ink leading-snug mb-1">
              {note.title}
            </h3>
            {note.body && (
              <p className="text-xs text-nido-mauve line-clamp-2 leading-relaxed">
                {note.body}
              </p>
            )}
          </div>
          <button
            onClick={() => del.mutate(note.id)}
            className="text-nido-mist hover:text-nido-rose transition-colors shrink-0 mt-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[10px] text-nido-mist mt-2.5">
          {new Date(note.created_at).toLocaleDateString('es', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}

// ─── Note Form ────────────────────────────────────────────────
function NoteForm({ onClose }: { onClose: () => void }) {
  const add = useAddNote()
  const [form, setForm] = useState({ title: '', body: '', tag: 'personal' as NoteTag })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    await add.mutateAsync(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg card p-5 space-y-3 animate-scale-in"
        style={{ boxShadow: '0 8px 40px -8px rgba(220,107,132,0.25)' }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">
            Nueva nota
          </p>
          <button type="button" onClick={onClose} className="text-nido-mist hover:text-nido-mauve transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tag selector */}
        <div className="flex gap-2 flex-wrap">
          {ALL_TAGS.map((tag) => {
            const cfg = TAG_CONFIG[tag]
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setForm({ ...form, tag })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  form.tag === tag
                    ? `${cfg.chipBg} ${cfg.chipText} shadow-sm`
                    : 'bg-nido-linen text-nido-mauve'
                }`}
              >
                {cfg.label}
              </button>
            )
          })}
        </div>

        <input
          className="input"
          placeholder="Título"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          autoFocus
        />

        <textarea
          className="input resize-none"
          placeholder="Escribe tu nota aquí..."
          rows={4}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={add.isPending} className="btn-primary flex-1">
            {add.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export function NotasModule() {
  const { data: notes = [], isLoading } = useNotes()
  const [showForm,  setShowForm]  = useState(false)
  const [filterTag, setFilterTag] = useState<NoteTag | 'all'>('all')

  const filtered = filterTag === 'all' ? notes : notes.filter((n) => n.tag === filterTag)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">Notas</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary py-2 px-3">
          <PlusCircle className="w-4 h-4" />
          <span>Nueva</span>
        </button>
      </div>

      {/* Tag filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => setFilterTag('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filterTag === 'all'
              ? 'bg-nido-rose text-white shadow-[0_2px_8px_-2px_rgba(220,107,132,0.45)]'
              : 'bg-nido-linen text-nido-mauve'
          }`}
        >
          Todas
        </button>
        {ALL_TAGS.map((tag) => {
          const cfg = TAG_CONFIG[tag]
          return (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterTag === tag
                  ? `${cfg.chipBg} ${cfg.chipText} shadow-sm`
                  : 'bg-nido-linen text-nido-mauve'
              }`}
            >
              {cfg.label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-nido-mist text-sm">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-nido-mauve text-sm">Sin notas</p>
          <p className="text-nido-mist text-xs mt-1">¡Crea tu primera nota!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note, i) => (
            <NoteCard key={note.id} note={note} delay={i * 55} />
          ))}
        </div>
      )}

      {showForm && <NoteForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
