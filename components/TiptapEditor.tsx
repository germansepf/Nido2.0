'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'

const NIDO_COLORS = [
  { label: 'Rosa',     value: '#c4786a' },
  { label: 'Verde',    value: '#7a9460' },
  { label: 'Ámbar',   value: '#c09040' },
  { label: 'Taupe',   value: '#b0a090' },
  { label: 'Oscuro',  value: '#2c1e14' },
]

function ToolbarBtn({ active, onClick, title, children }: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-1.5 py-1 rounded-lg text-xs font-medium transition-all flex flex-col items-center leading-none min-w-[1.75rem] ${
        active
          ? 'bg-nido-rose text-white'
          : 'text-nido-mauve hover:bg-nido-rose-pale hover:text-nido-rose'
      }`}
    >
      {children}
    </button>
  )
}

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export function TiptapEditor({ content, onChange, placeholder = 'Escribe aquí...', minHeight = '120px' }: TiptapEditorProps) {
  const [isSerif,     setIsSerif]     = useState(false)
  const [showColors,  setShowColors]  = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: false }),
      Color,
      TextStyle,
      Typography,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: `tiptap-content outline-none text-sm text-nido-ink leading-relaxed ${isSerif ? 'font-display' : ''}`,
        style: `min-height: ${minHeight}`,
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  return (
    <div className="border border-nido-rose-pale rounded-2xl overflow-hidden bg-nido-cream focus-within:border-nido-rose focus-within:shadow-[0_0_0_3px_rgba(196,120,106,0.12)] transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2.5 py-2 border-b border-nido-rose-pale/50 bg-nido-linen/60 flex-wrap">
        <ToolbarBtn active={editor.isActive('bold')}   onClick={() => editor.chain().focus().toggleBold().run()}   title="Negrita"><strong className="text-[11px]">B</strong></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva"><em className="text-[11px]">I</em></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachado"><s className="text-[11px]">S</s></ToolbarBtn>

        <span className="w-px h-4 bg-nido-rose-pale mx-0.5" />

        <ToolbarBtn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Lista"><span className="text-[11px]">≡</span></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numerada"><span className="text-[11px]">1.</span></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('taskList')}    onClick={() => editor.chain().focus().toggleTaskList().run()}    title="Checklist"><span className="text-[11px]">☑</span></ToolbarBtn>

        <span className="w-px h-4 bg-nido-rose-pale mx-0.5" />

        {/* Color picker */}
        <div className="relative">
          <ToolbarBtn active={showColors} onClick={() => setShowColors(v => !v)} title="Color">
            <span className="text-[11px] font-bold leading-none">A</span>
            <span className="w-2.5 h-0.5 rounded-full mt-0.5" style={{ backgroundColor: '#c4786a' }} />
          </ToolbarBtn>
          {showColors && (
            <div className="absolute top-full left-0 mt-1 flex gap-1 p-2 card shadow-lg z-20">
              {NIDO_COLORS.map(c => (
                <button key={c.value} type="button"
                  onClick={() => { editor.chain().focus().setColor(c.value).run(); setShowColors(false) }}
                  title={c.label}
                  className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <button type="button"
                onClick={() => { editor.chain().focus().unsetColor().run(); setShowColors(false) }}
                className="w-5 h-5 rounded-full border border-nido-rose-pale text-[8px] flex items-center justify-center text-nido-mist hover:bg-nido-linen"
                title="Sin color"
              >✕</button>
            </div>
          )}
        </div>

        <ToolbarBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()} title="Resaltar"><span className="text-[11px]">★</span></ToolbarBtn>

        <span className="w-px h-4 bg-nido-rose-pale mx-0.5" />

        <ToolbarBtn active={isSerif} onClick={() => setIsSerif(v => !v)} title="Tipografía diario">
          <span className={`text-[11px] ${isSerif ? 'font-display' : ''}`}>Aa</span>
        </ToolbarBtn>

        <ToolbarBtn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separador">
          <span className="text-[11px]">—</span>
        </ToolbarBtn>
      </div>

      {/* Editor */}
      <div className="relative px-4 py-3">
        {editor.isEmpty && (
          <p className="absolute top-3 left-4 text-sm text-nido-mist pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
