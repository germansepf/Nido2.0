'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const EmojiPickerPanel = dynamic(() => import('@emoji-mart/react'), { ssr: false })

interface Props {
  emoji: string
  onSelect: (emoji: string) => void
  size?: number
  className?: string
}

export function EmojiPickerButton({ emoji, onSelect, size = 26, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<unknown>(null)

  useEffect(() => {
    if (open && !data) {
      import('@emoji-mart/data').then(m => setData(m.default))
    }
  }, [open, data])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ fontSize: size }}
        className={`leading-none rounded-xl hover:scale-110 active:scale-95 transition-transform duration-150 select-none ${className}`}
        title="Cambiar emoji"
      >
        {emoji}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg rounded-t-3xl overflow-hidden shadow-2xl animate-slide-up">
            {data ? (
              <EmojiPickerPanel
                data={data}
                onEmojiSelect={(e: { native: string }) => {
                  onSelect(e.native)
                  setOpen(false)
                }}
                set="apple"
                locale="es"
                theme="light"
                previewPosition="none"
                skinTonePosition="none"
                maxFrequentRows={2}
              />
            ) : (
              <div className="bg-white p-10 text-center text-nido-mist text-sm">Cargando emojis…</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
