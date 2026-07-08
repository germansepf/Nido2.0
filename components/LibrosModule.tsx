'use client'

import { useState, useMemo } from 'react'
import { TrashIcon, XIcon, QuotesIcon } from '@phosphor-icons/react'
import { useBooks, useAddBook, useUpdateBook, useDeleteBook, useVocabulary, useAddWord, useDeleteWord } from '@/hooks/useLibros'
import { EmojiPickerButton } from '@/components/EmojiPickerButton'
import type { Book, BookStatus, VocabWord } from '@/lib/types'

const STATUS_CFG: Record<BookStatus, { label: string; chipBg: string; chipText: string; strip: string }> = {
  leyendo:     { label: 'Leyendo',   chipBg: 'bg-nido-sage-pale',     chipText: 'text-nido-sage-deep',     strip: 'bg-nido-sage'     },
  quiero_leer: { label: 'Por leer',  chipBg: 'bg-nido-lavender-pale', chipText: 'text-nido-lavender-deep', strip: 'bg-nido-lavender' },
  leido:       { label: 'Leído',     chipBg: 'bg-nido-amber-pale',    chipText: 'text-nido-amber',         strip: 'bg-nido-amber'    },
}

const TABS: { key: BookStatus | 'vocab'; label: string; emoji: string }[] = [
  { key: 'leyendo',     label: 'Leyendo',    emoji: '📖' },
  { key: 'quiero_leer', label: 'Por leer',   emoji: '🗂️' },
  { key: 'leido',       label: 'Leídos',     emoji: '✅' },
  { key: 'vocab',       label: 'Palabras',   emoji: '🔤' },
]

// ─── Book Form ────────────────────────────────────────────────
function BookForm({ onClose }: { onClose: () => void }) {
  const add = useAddBook()
  const [form, setForm] = useState({
    title: '', author: '', status: 'quiero_leer' as BookStatus,
    started_at: '', finished_at: '', favorite_quote: '', cover_emoji: '📚',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    await add.mutateAsync({
      title: form.title.trim(),
      author: form.author.trim() || null,
      status: form.status,
      cover_emoji: form.cover_emoji,
      started_at: form.started_at || null,
      finished_at: form.finished_at || null,
      favorite_quote: form.favorite_quote.trim() || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg card p-5 space-y-3 animate-slide-up max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 -4px 40px -8px rgba(196,120,106,0.22)' }}>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EmojiPickerButton emoji={form.cover_emoji} onSelect={e => setForm({...form, cover_emoji: e})} size={30} />
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">Agregar libro</p>
          </div>
          <button type="button" onClick={onClose} className="text-nido-mist hover:text-nido-mauve">
            <XIcon size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          {(['leyendo', 'quiero_leer', 'leido'] as BookStatus[]).map(s => {
            const cfg = STATUS_CFG[s]
            return (
              <button key={s} type="button" onClick={() => setForm({...form, status: s})}
                className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                  form.status === s ? `${cfg.chipBg} ${cfg.chipText} scale-105` : 'bg-nido-linen text-nido-mauve'
                }`}>
                {cfg.label}
              </button>
            )
          })}
        </div>

        <input className="input" placeholder="Título *" required autoFocus
          value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <input className="input" placeholder="Autor (opcional)"
          value={form.author} onChange={e => setForm({...form, author: e.target.value})} />

        {form.status === 'leido' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] text-nido-mist mb-1">Empecé</p>
                <input type="date" className="input text-xs py-1.5"
                  value={form.started_at} onChange={e => setForm({...form, started_at: e.target.value})} />
              </div>
              <div>
                <p className="text-[9px] text-nido-mist mb-1">Terminé</p>
                <input type="date" className="input text-xs py-1.5"
                  value={form.finished_at} onChange={e => setForm({...form, finished_at: e.target.value})} />
              </div>
            </div>
            <textarea className="input resize-none text-xs" rows={3}
              placeholder="Frase favorita del libro..."
              value={form.favorite_quote} onChange={e => setForm({...form, favorite_quote: e.target.value})} />
          </>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={add.isPending} className="btn-primary flex-1">Guardar</button>
        </div>
      </form>
    </div>
  )
}

// ─── Book Card ────────────────────────────────────────────────
function BookCard({ book }: { book: Book }) {
  const del    = useDeleteBook()
  const update = useUpdateBook()
  const cfg    = STATUS_CFG[book.status]
  const [expanded, setExpanded] = useState(false)

  function cycleStatus() {
    const next: BookStatus = book.status === 'quiero_leer' ? 'leyendo' : book.status === 'leyendo' ? 'leido' : 'quiero_leer'
    update.mutate({ id: book.id, status: next })
  }

  return (
    <div className="card flex items-stretch overflow-hidden animate-fade-up">
      <span className={`w-1.5 shrink-0 ${cfg.strip}`} />
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-start gap-3">
          <button onClick={() => setExpanded(v => !v)} className="text-3xl leading-none shrink-0 hover:scale-110 transition-transform">
            {book.cover_emoji}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${cfg.chipBg} ${cfg.chipText}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-sm font-semibold text-nido-ink leading-snug">{book.title}</p>
            {book.author && <p className="text-xs text-nido-mist mt-0.5">{book.author}</p>}
            {book.status === 'leido' && book.finished_at && (
              <p className="text-[9px] text-nido-mist mt-0.5">
                Terminado {new Date(book.finished_at + 'T12:00:00').toLocaleDateString('es', { month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={cycleStatus} title="Cambiar estado"
              className="text-nido-mist hover:text-nido-sage transition-colors text-xs">→</button>
            <button onClick={() => del.mutate(book.id)} className="text-nido-mist hover:text-nido-rose transition-colors">
              <TrashIcon size={13} />
            </button>
          </div>
        </div>

        {expanded && book.favorite_quote && (
          <div className="mt-3 flex gap-2 bg-nido-amber-pale/60 rounded-xl px-3 py-2 animate-fade-up">
            <QuotesIcon size={14} className="text-nido-amber shrink-0 mt-0.5" weight="fill" />
            <p className="text-xs text-nido-ink italic leading-relaxed">{book.favorite_quote}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Vocabulary Section ───────────────────────────────────────
function VocabSection() {
  const { data: words = [], isLoading } = useVocabulary()
  const addWord = useAddWord()
  const delWord = useDeleteWord()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ word: '', definition: '', source: '' })
  const [search, setSearch] = useState('')

  const dailyWord = useMemo(() => {
    if (words.length === 0) return null
    return words[new Date().getDate() % words.length]
  }, [words])

  const filtered = words.filter(w =>
    !search || w.word.toLowerCase().includes(search.toLowerCase()) || (w.definition?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.word.trim()) return
    await addWord.mutateAsync({ word: form.word.trim(), definition: form.definition.trim() || null, source: form.source.trim() || null })
    setForm({ word: '', definition: '', source: '' })
    setShowForm(false)
  }

  return (
    <div>
      {dailyWord && (
        <div className="card px-4 py-3.5 mb-4 bg-nido-lavender-pale/60 border-nido-lavender/30">
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Palabra del día</p>
          <p className="text-base font-semibold text-nido-ink">{dailyWord.word}</p>
          {dailyWord.definition && <p className="text-xs text-nido-mauve mt-0.5 leading-relaxed">{dailyWord.definition}</p>}
          {dailyWord.source && <p className="text-[9px] text-nido-mist mt-1 italic">— {dailyWord.source}</p>}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist">{words.length} palabras guardadas</p>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary py-1.5 px-3 text-xs">+ Agregar</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-4 space-y-2 mb-4 animate-slide-up">
          <input className="input" placeholder="Palabra *" required autoFocus
            value={form.word} onChange={e => setForm({...form, word: e.target.value})} />
          <input className="input" placeholder="Definición (opcional)"
            value={form.definition} onChange={e => setForm({...form, definition: e.target.value})} />
          <input className="input" placeholder="Fuente — libro, película... (opcional)"
            value={form.source} onChange={e => setForm({...form, source: e.target.value})} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-1.5">Cancelar</button>
            <button type="submit" disabled={addWord.isPending} className="btn-primary flex-1 py-1.5">Guardar</button>
          </div>
        </form>
      )}

      <input className="input mb-3" placeholder="Buscar palabra..."
        value={search} onChange={e => setSearch(e.target.value)} />

      {isLoading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="skeleton h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-3xl mb-2">🔤</p>
          <p className="text-nido-mist text-sm">{search ? 'Sin resultados' : 'Sin palabras aún'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w: VocabWord) => (
            <div key={w.id} className="card px-4 py-3 flex items-start gap-3 animate-fade-up">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-nido-ink">{w.word}</p>
                {w.definition && <p className="text-xs text-nido-mauve mt-0.5 leading-relaxed">{w.definition}</p>}
                {w.source && <p className="text-[9px] text-nido-mist mt-1 italic">— {w.source}</p>}
              </div>
              <button onClick={() => delWord.mutate(w.id)} className="text-nido-mist hover:text-nido-rose transition-colors shrink-0 mt-0.5">
                <TrashIcon size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export function LibrosModule() {
  const { data: books = [], isLoading } = useBooks()
  const [tab,      setTab]      = useState<BookStatus | 'vocab'>('leyendo')
  const [showForm, setShowForm] = useState(false)

  const booksInTab  = books.filter(b => tab !== 'vocab' && b.status === tab)
  const readingNow  = books.filter(b => b.status === 'leyendo')
  const totalRead   = books.filter(b => b.status === 'leido').length

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">📚 Libros</h1>
        {tab !== 'vocab' && (
          <button onClick={() => setShowForm(true)} className="btn-primary py-2 px-3">
            <span className="text-base leading-none">✦</span>
            <span>Agregar</span>
          </button>
        )}
      </div>

      {/* Stats */}
      {books.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="card p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Leyendo</p>
            <p className="text-xl font-bold text-nido-sage-deep">{readingNow.length}</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Leídos</p>
            <p className="text-xl font-bold text-nido-amber">{totalRead}</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-1">Por leer</p>
            <p className="text-xl font-bold text-nido-lavender-deep">{books.filter(b => b.status === 'quiero_leer').length}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {TABS.map(({ key, label, emoji }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              tab === key ? 'bg-nido-rose text-white shadow-sm' : 'bg-nido-linen text-nido-mauve'
            }`}>
            <span>{emoji}</span>{label}
            {key !== 'vocab' && books.filter(b => b.status === key).length > 0 && (
              <span className={`text-[9px] ${tab === key ? 'opacity-80' : 'opacity-60'}`}>
                ({books.filter(b => b.status === key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'vocab' ? (
        <VocabSection />
      ) : isLoading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-24" />)}</div>
      ) : booksInTab.length === 0 ? (
        <div className="text-center py-14">
          <p className="text-4xl mb-3">{TABS.find(t => t.key === tab)?.emoji}</p>
          <p className="text-nido-mauve text-sm">Sin libros en esta categoría</p>
          <p className="text-nido-mist text-xs mt-1">¡Agrega tu primer libro!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {booksInTab.map((book, i) => (
            <div key={book.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}

      {showForm && <BookForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
