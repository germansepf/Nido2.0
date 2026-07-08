'use client'

import { useState, useMemo } from 'react'
import { TrashIcon, XIcon, MagnifyingGlassIcon, PushPinIcon, PushPinSlashIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { useNotes, useAddNote, useDeleteNote } from '@/hooks/useNotas'
import { EmojiPickerButton } from '@/components/EmojiPickerButton'
import { TiptapEditor } from '@/components/TiptapEditor'
import type { NoteTag, Note } from '@/lib/types'

const DEFAULT_NOTE_EMOJI = '📝'

function loadNoteEmojis(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('nido-note-emojis') ?? '{}') } catch { return {} }
}

const TAG_CONFIG: Record<NoteTag, { label: string; strip: string; chipBg: string; chipText: string }> = {
  personal: { label: 'Personal', strip: 'bg-nido-rose',     chipBg: 'bg-nido-rose-pale',     chipText: 'text-nido-rose-deep'      },
  trabajo:  { label: 'Trabajo',  strip: 'bg-nido-lavender', chipBg: 'bg-nido-lavender-pale', chipText: 'text-nido-lavender-deep'  },
  ideas:    { label: 'Ideas',    strip: 'bg-nido-amber',    chipBg: 'bg-nido-amber-pale',    chipText: 'text-nido-amber'          },
  salud:    { label: 'Salud',    strip: 'bg-nido-sage',     chipBg: 'bg-nido-sage-pale',     chipText: 'text-nido-sage-deep'      },
  capsula:  { label: 'Cápsula',  strip: 'bg-nido-mist',    chipBg: 'bg-nido-linen',         chipText: 'text-nido-mauve'          },
}

const ALL_TAGS = Object.keys(TAG_CONFIG) as NoteTag[]

const PROMPTS = [
  '¿Qué te hizo sonreír hoy?',
  '¿Qué aprendiste esta semana?',
  '¿Qué te preocupa y qué puedes soltar?',
  '¿Cuál fue lo mejor de hoy?',
  '¿Qué quieres que no cambie nunca?',
  '¿Qué le dirías a tu yo del futuro?',
  '¿Qué momento de hoy quieres recordar siempre?',
  '¿Qué libro o frase te marcó esta semana?',
  '¿Qué sientes hoy que no has podido decir?',
  '¿Cuál fue tu mayor logro reciente?',
  '¿Qué te da miedo y por qué vale la pena de todas formas?',
  '¿Qué cambiarías de tu rutina?',
]

function todayStr() { return new Date().toISOString().split('T')[0] }

// ─── Note Detail Modal ────────────────────────────────────────
function NoteDetail({ note, onClose }: { note: Note; onClose: () => void }) {
  const cfg     = TAG_CONFIG[note.tag]
  const today   = todayStr()
  const locked  = note.tag === 'capsula' && !!note.unlock_date && note.unlock_date > today
  const unlocked = note.tag === 'capsula' && !!note.unlock_date && note.unlock_date <= today

  async function exportPDF() {
    const { default: html2canvas } = await import('html2canvas')
    const { default: jsPDF }       = await import('jspdf')
    const el = document.getElementById('note-pdf-area')
    if (!el) return
    const canvas  = await html2canvas(el, { scale: 2, backgroundColor: '#fdf9f2', useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const w       = pdf.internal.pageSize.getWidth()
    pdf.addImage(imgData, 'PNG', 0, 0, w, (canvas.height * w) / canvas.width)
    pdf.save(`${note.title}.pdf`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg card p-5 animate-slide-up max-h-[85vh] flex flex-col"
        style={{ boxShadow: '0 -4px 40px -8px rgba(196,120,106,0.2)' }}>

        <div className="flex items-start justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText}`}>
              {cfg.label}
            </span>
            {unlocked && (
              <span className="text-[9px] text-nido-amber font-medium animate-pop">✨ Se abrió hoy</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!locked && (
              <button onClick={exportPDF} title="Exportar PDF"
                className="text-nido-mist hover:text-nido-mauve transition-colors">
                <DownloadSimpleIcon size={18} />
              </button>
            )}
            <button onClick={onClose} className="text-nido-mist hover:text-nido-mauve transition-colors">
              <XIcon size={20} />
            </button>
          </div>
        </div>

        {locked ? (
          <div className="text-center py-10 flex-1">
            <p className="text-5xl mb-4">💌</p>
            <p className="text-sm font-medium text-nido-ink mb-1">Cápsula sellada</p>
            <p className="text-xs text-nido-mist">
              Se abrirá el {new Date(note.unlock_date! + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1" id="note-pdf-area">
            <h2 className="text-lg font-semibold text-nido-ink mb-3">{note.title}</h2>
            {note.body && (
              <div
                className="text-sm text-nido-mauve leading-relaxed tiptap-content mb-4"
                dangerouslySetInnerHTML={{ __html: note.body }}
              />
            )}
            <p className="text-[10px] text-nido-mist">
              {new Date(note.created_at).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Note Card ────────────────────────────────────────────────
function NoteCard({ note, delay, pinned, onPin, onOpen, emoji, onEmojiChange }: {
  note: Note; delay: number; pinned: boolean
  onPin: () => void; onOpen: () => void; emoji: string; onEmojiChange: (e: string) => void
}) {
  const del   = useDeleteNote()
  const cfg   = TAG_CONFIG[note.tag]
  const today = todayStr()
  const isLocked  = note.tag === 'capsula' && !!note.unlock_date && note.unlock_date > today
  const isCapsula = note.tag === 'capsula'

  const daysUntilOpen = isLocked && note.unlock_date
    ? Math.ceil((new Date(note.unlock_date + 'T12:00:00').getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    : 0

  if (isLocked) {
    return (
      <div className="card flex items-stretch overflow-hidden animate-fade-up opacity-80" style={{ animationDelay: `${delay}ms` }}>
        <span className={`w-1.5 shrink-0 ${cfg.strip}`} />
        <div className="flex-1 p-4 flex items-center gap-3">
          <span className="text-2xl">💌</span>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-0.5">Cápsula sellada</p>
            <p className="text-sm font-medium text-nido-ink truncate">{note.title}</p>
            <p className="text-[10px] text-nido-mist mt-0.5">Se abre en {daysUntilOpen}d</p>
          </div>
          <button onClick={() => del.mutate(note.id)} className="text-nido-mist hover:text-nido-rose transition-colors shrink-0">
            <TrashIcon size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card-lift card flex items-stretch overflow-hidden animate-fade-up cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onOpen}>
      <span className={`w-1.5 shrink-0 ${cfg.strip}`} />
      <div className="flex-1 min-w-0 p-4">
        <div className="flex items-start gap-2 mb-2">
          <div onClick={e => e.stopPropagation()}>
            <EmojiPickerButton emoji={emoji} onSelect={onEmojiChange} size={22} />
          </div>
          <div className="flex-1 min-w-0 mt-0.5">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText}`}>
                {cfg.label}
              </span>
              {pinned && <span className="text-[9px] text-nido-amber font-medium">📌</span>}
              {isCapsula && !isLocked && <span className="text-[9px] text-nido-amber">✨</span>}
            </div>
            <h3 className="text-sm font-semibold text-nido-ink leading-snug mb-0.5">{note.title}</h3>
            {note.body && (
              <div className="text-xs text-nido-mauve line-clamp-2 leading-relaxed tiptap-content"
                dangerouslySetInnerHTML={{ __html: note.body }} />
            )}
          </div>
          <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={onPin} className="text-nido-mist hover:text-nido-amber transition-colors">
              {pinned ? <PushPinSlashIcon size={14} /> : <PushPinIcon size={14} />}
            </button>
            <button onClick={() => del.mutate(note.id)} className="text-nido-mist hover:text-nido-rose transition-colors">
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-nido-mist">
          {new Date(note.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

// ─── Note Form ────────────────────────────────────────────────
function NoteForm({ onClose, onEmojiCreated }: { onClose: () => void; onEmojiCreated: (id: string, emoji: string) => void }) {
  const add = useAddNote()

  const [tag,        setTag]        = useState<NoteTag>('personal')
  const [title,      setTitle]      = useState('')
  const [body,       setBody]       = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [noteEmoji,  setNoteEmoji]  = useState(DEFAULT_NOTE_EMOJI)
  const [editorKey,  setEditorKey]  = useState(0)

  const todayPrompt = PROMPTS[new Date().getDate() % PROMPTS.length]

  function applyPrompt() {
    setBody(`<p><em>${todayPrompt}</em></p><p></p>`)
    setEditorKey(k => k + 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const note = await add.mutateAsync({
      title: title.trim(),
      body,
      tag,
      unlock_date: tag === 'capsula' ? (unlockDate || null) : null,
    })
    if (note) onEmojiCreated(note.id, noteEmoji)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg card p-5 space-y-3 animate-slide-up max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: '0 -4px 40px -8px rgba(196,120,106,0.22)' }}>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EmojiPickerButton emoji={noteEmoji} onSelect={setNoteEmoji} size={26} />
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">Nueva nota</p>
          </div>
          <button type="button" onClick={onClose} className="text-nido-mist hover:text-nido-mauve transition-colors">
            <XIcon size={20} />
          </button>
        </div>

        {/* Tag selector */}
        <div className="flex gap-2 flex-wrap">
          {ALL_TAGS.map(t => {
            const cfg = TAG_CONFIG[t]
            return (
              <button key={t} type="button" onClick={() => setTag(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  tag === t ? `${cfg.chipBg} ${cfg.chipText} shadow-sm scale-105` : 'bg-nido-linen text-nido-mauve'
                }`}>
                {cfg.label}
              </button>
            )
          })}
        </div>

        <input className="input" placeholder="Título" value={title}
          onChange={e => setTitle(e.target.value)} required autoFocus />

        {/* Unlock date for cápsulas */}
        {tag === 'capsula' && (
          <div className="flex items-center gap-3 bg-nido-linen rounded-xl px-3 py-2.5">
            <span className="text-xl">💌</span>
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Abrir el día</p>
              <input type="date" className="input py-1 text-xs"
                value={unlockDate} onChange={e => setUnlockDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        )}

        {/* Writing prompt */}
        {(tag === 'personal' || tag === 'capsula') && !body && (
          <button type="button" onClick={applyPrompt}
            className="w-full text-left text-xs text-nido-mist bg-nido-linen/70 border border-dashed border-nido-rose-pale rounded-xl px-3 py-2 hover:border-nido-rose hover:text-nido-mauve transition-all">
            ✨ <em>"{todayPrompt}"</em>
          </button>
        )}

        {/* Rich editor */}
        <TiptapEditor
          key={editorKey}
          content={body}
          onChange={setBody}
          placeholder="Escribe tu nota aquí..."
          minHeight="130px"
        />

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

// ─── Diario (timeline de notas personales) ────────────────────
function DiarioView({ notes }: { notes: Note[] }) {
  const personal = [...notes]
    .filter(n => n.tag === 'personal')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))

  const [openId, setOpenId] = useState<string | null>(null)

  if (personal.length === 0) {
    return (
      <div className="text-center py-14">
        <p className="text-4xl mb-3">📖</p>
        <p className="text-nido-mauve text-sm">Sin entradas de diario aún</p>
        <p className="text-nido-mist text-xs mt-1">Crea una nota Personal para empezar</p>
      </div>
    )
  }

  const grouped = personal.reduce<Record<string, Note[]>>((acc, n) => {
    const month = new Date(n.created_at).toLocaleDateString('es', { month: 'long', year: 'numeric' })
    acc[month] = acc[month] ?? []
    acc[month].push(n)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([month, entries]) => (
        <div key={month}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-3 capitalize">{month}</p>
          <div className="space-y-4 pl-3 border-l-2 border-nido-rose-pale">
            {entries.map(note => (
              <div key={note.id} className="relative">
                <span className="absolute -left-[1.19rem] top-1 w-3 h-3 rounded-full bg-nido-rose-pale border-2 border-nido-rose" />
                <p className="text-[10px] text-nido-mist mb-1 capitalize">
                  {new Date(note.created_at).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <div
                  className="card px-4 py-3 cursor-pointer card-lift"
                  onClick={() => setOpenId(openId === note.id ? null : note.id)}
                >
                  <h3 className="text-sm font-semibold text-nido-ink mb-1">{note.title}</h3>
                  {openId === note.id && note.body && (
                    <div className="text-sm text-nido-mauve leading-relaxed tiptap-content mt-2 animate-fade-up"
                      dangerouslySetInnerHTML={{ __html: note.body }} />
                  )}
                  {openId !== note.id && note.body && (
                    <div className="text-xs text-nido-mauve line-clamp-2 leading-relaxed tiptap-content"
                      dangerouslySetInnerHTML={{ __html: note.body }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export function NotasModule() {
  const { data: notes = [], isLoading } = useNotes()

  const [viewMode,   setViewMode]   = useState<'lista' | 'diario'>('lista')
  const [showForm,   setShowForm]   = useState(false)
  const [filterTag,  setFilterTag]  = useState<NoteTag | 'all'>('all')
  const [search,     setSearch]     = useState('')
  const [detailNote, setDetailNote] = useState<Note | null>(null)
  const [pinnedIds,  setPinnedIds]  = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('nido-pinned-notes') ?? '[]')
  })
  const [noteEmojis, setNoteEmojis] = useState<Record<string, string>>(loadNoteEmojis)

  function togglePin(id: string) {
    const updated = pinnedIds.includes(id) ? pinnedIds.filter(x => x !== id) : [...pinnedIds, id]
    setPinnedIds(updated)
    localStorage.setItem('nido-pinned-notes', JSON.stringify(updated))
  }

  function saveNoteEmoji(noteId: string, emoji: string) {
    const updated = { ...noteEmojis, [noteId]: emoji }
    setNoteEmojis(updated)
    localStorage.setItem('nido-note-emojis', JSON.stringify(updated))
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
          <span className="text-base leading-none">✦</span>
          <span>Nueva</span>
        </button>
      </div>

      {/* Vista toggle */}
      <div className="flex gap-2 mb-4">
        {(['lista', 'diario'] as const).map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
              viewMode === mode
                ? 'bg-nido-rose text-white shadow-[0_2px_8px_-2px_rgba(196,120,106,0.4)]'
                : 'bg-nido-linen text-nido-mauve'
            }`}>
            {mode === 'lista' ? '≡ Lista' : '📖 Diario'}
          </button>
        ))}
      </div>

      {viewMode === 'diario' ? (
        <DiarioView notes={notes} />
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-3">
            <MagnifyingGlassIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nido-mist pointer-events-none" />
            <input className="input pl-9" placeholder="Buscar en notas..."
              value={search} onChange={e => setSearch(e.target.value)} />
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
              const cfg   = TAG_CONFIG[tag]
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
                <NoteCard key={note.id} note={note} delay={i * 50}
                  pinned={pinnedIds.includes(note.id)}
                  onPin={() => togglePin(note.id)}
                  onOpen={() => setDetailNote(note)}
                  emoji={noteEmojis[note.id] ?? DEFAULT_NOTE_EMOJI}
                  onEmojiChange={(e) => saveNoteEmoji(note.id, e)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showForm   && <NoteForm onClose={() => setShowForm(false)} onEmojiCreated={saveNoteEmoji} />}
      {detailNote && <NoteDetail note={detailNote} onClose={() => setDetailNote(null)} />}
    </div>
  )
}
