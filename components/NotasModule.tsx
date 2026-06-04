'use client'

import { useState, useMemo } from 'react'
import { PlusCircleIcon, TrashIcon, XIcon, MagnifyingGlassIcon, PushPinIcon, PushPinSlashIcon } from '@phosphor-icons/react'
import { useNotes, useAddNote, useDeleteNote } from '@/hooks/useNotas'
import type { NoteTag } from '@/lib/types'

const TAG_CONFIG: Record<NoteTag, { label: string; strip: string; chipBg: string; chipText: string }> = {
  personal: { label: 'Personal', strip: 'bg-nido-rose',     chipBg: 'bg-nido-rose-pale',     chipText: 'text-nido-rose-deep' },
  trabajo:  { label: 'Trabajo',  strip: 'bg-nido-lavender', chipBg: 'bg-nido-lavender-pale', chipText: 'text-nido-lavender-deep' },
  ideas:    { label: 'Ideas',    strip: 'bg-nido-amber',    chipBg: 'bg-nido-amber-pale',    chipText: 'text-nido-amber' },
  salud:    { label: 'Salud',    strip: 'bg-nido-sage',     chipBg: 'bg-nido-sage-pale',     chipText: 'text-nido-sage-deep' },
}

const ALL_TAGS = Object.keys(TAG_CONFIG) as NoteTag[]

// ─── Note Detail Modal ────────────────────────────────────────
function NoteDetail({ note, onClose }: {
  note: { id: string; title: string; body: string | null; tag: NoteTag; created_at: string }
  onClose: () => void
}) {
  const cfg = TAG_CONFIG[note.tag]
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg card p-5 animate-slide-up" style={{ boxShadow: '0 -4px 40px -8px rgba(196,120,106,0.2)' }}>
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText}`}>
            {cfg.label}
          </span>
          <button onClick={onClose} className="text-nido-mist hover:text-nido-mauve transition-colors">
            <XIcon size={20} />
          </button>
        </div>
        <h2 className="text-lg font-semibold text-nido-ink mb-3">{note.title}</h2>
        {note.body && (
          <p className="text-sm text-nido-mauve leading-relaxed whitespace-pre-wrap mb-4">{note.body}</p>
        )}
        <p className="text-[10px] text-nido-mist">
          {new Date(note.created_at).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

// ─── Note Card ────────────────────────────────────────────────
function NoteCard({ note, delay, pinned, onPin, onOpen }: {
  note: { id: string; title: string; body: string | null; tag: NoteTag; created_at: string }
  delay: number
  pinned: boolean
  onPin: () => void
  onOpen: () => void
}) {
  const del = useDeleteNote()
  const cfg = TAG_CONFIG[note.tag]

  return (
    <div
      className="card-lift card flex items-stretch overflow-hidden animate-fade-up cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onOpen}
    >
      <span className={`w-1.5 shrink-0 ${cfg.strip}`} />
      <div className="flex-1 min-w-0 p-4">
        <div className="flex items-start gap-2 mb-1.5">
          <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText}`}>
            {cfg.label}
          </span>
          {pinned && <span className="text-[9px] text-nido-amber font-medium">📌 fijada</span>}
        </div>

        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-nido-ink leading-snug mb-1">{note.title}</h3>
            {note.body && (
              <p className="text-xs text-nido-mauve line-clamp-2 leading-relaxed">{note.body}</p>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0 mt-0.5" onClick={e => e.stopPropagation()}>
            <button onClick={onPin} className="text-nido-mist hover:text-nido-amber transition-colors">
              {pinned ? <PushPinSlashIcon size={14} /> : <PushPinIcon size={14} />}
            </button>
            <button onClick={() => del.mutate(note.id)} className="text-nido-mist hover:text-nido-rose transition-colors">
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-nido-mist mt-2.5">
          {new Date(note.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-lg card p-5 space-y-3 animate-slide-up"
        style={{ boxShadow: '0 -4px 40px -8px rgba(196,120,106,0.22)' }}>
        <div className="flex items-center justify-between">
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">Nueva nota</p>
          <button type="button" onClick={onClose} className="text-nido-mist hover:text-nido-mauve transition-colors">
            <XIcon size={20} />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {ALL_TAGS.map(tag => {
            const cfg = TAG_CONFIG[tag]
            return (
              <button key={tag} type="button" onClick={() => setForm({ ...form, tag })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  form.tag === tag ? `${cfg.chipBg} ${cfg.chipText} shadow-sm scale-105` : 'bg-nido-linen text-nido-mauve'
                }`}>
                {cfg.label}
              </button>
            )
          })}
        </div>

        <input className="input" placeholder="Título" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} required autoFocus />
        <textarea className="input resize-none" placeholder="Escribe tu nota aquí..." rows={4}
          value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
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
  const [showForm,   setShowForm]   = useState(false)
  const [filterTag,  setFilterTag]  = useState<NoteTag | 'all'>('all')
  const [search,     setSearch]     = useState('')
  const [detailNote, setDetailNote] = useState<typeof notes[0] | null>(null)
  const [pinnedIds,  setPinnedIds]  = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('nido-pinned-notes') ?? '[]')
  })

  function togglePin(id: string) {
    const updated = pinnedIds.includes(id) ? pinnedIds.filter(x => x !== id) : [...pinnedIds, id]
    setPinnedIds(updated)
    localStorage.setItem('nido-pinned-notes', JSON.stringify(updated))
  }

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    notes.forEach(n => { counts[n.tag] = (counts[n.tag] ?? 0) + 1 })
    return counts
  }, [notes])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return notes
      .filter(n => filterTag === 'all' || n.tag === filterTag)
      .filter(n => !q || n.title.toLowerCase().includes(q) || (n.body?.toLowerCase().includes(q) ?? false))
      .sort((a, b) => {
        const ap = pinnedIds.includes(a.id) ? 1 : 0
        const bp = pinnedIds.includes(b.id) ? 1 : 0
        return bp - ap
      })
  }, [notes, filterTag, search, pinnedIds])

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">📒 Notas</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary py-2 px-3">
          <PlusCircleIcon className="w-4 h-4" />
          <span>Nueva</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nido-mist pointer-events-none" />
        <input
          className="input pl-9"
          placeholder="Buscar en notas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-nido-mist hover:text-nido-mauve transition-colors">
            <XIcon size={16} />
          </button>
        )}
      </div>

      {/* Tag filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        <button onClick={() => setFilterTag('all')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            filterTag === 'all' ? 'bg-nido-rose text-white shadow-[0_2px_8px_-2px_rgba(196,120,106,0.45)]' : 'bg-nido-linen text-nido-mauve'
          }`}>
          Todas {notes.length > 0 && <span className="opacity-70">({notes.length})</span>}
        </button>
        {ALL_TAGS.map(tag => {
          const cfg = TAG_CONFIG[tag]
          const count = tagCounts[tag] ?? 0
          return (
            <button key={tag} onClick={() => setFilterTag(tag)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                filterTag === tag ? `${cfg.chipBg} ${cfg.chipText} shadow-sm` : 'bg-nido-linen text-nido-mauve'
              }`}>
              {cfg.label} {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24" style={{ animationDelay: `${i * 80}ms` }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">{search ? '🔍' : '📝'}</p>
          <p className="text-nido-mauve text-sm">{search ? 'Sin resultados' : 'Sin notas'}</p>
          <p className="text-nido-mist text-xs mt-1">
            {search ? `Ninguna nota contiene "${search}"` : '¡Crea tu primera nota!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((note, i) => (
            <NoteCard
              key={note.id}
              note={note}
              delay={i * 50}
              pinned={pinnedIds.includes(note.id)}
              onPin={() => togglePin(note.id)}
              onOpen={() => setDetailNote(note)}
            />
          ))}
        </div>
      )}

      {showForm    && <NoteForm onClose={() => setShowForm(false)} />}
      {detailNote  && <NoteDetail note={detailNote} onClose={() => setDetailNote(null)} />}
    </div>
  )
}
