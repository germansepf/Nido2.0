'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type { Book, BookStatus, VocabWord } from '@/lib/types'

const supabase = createClient()

// ─── Books ────────────────────────────────────────────────────
export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Book[]
    },
  })
}

export function useAddBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (book: {
      title: string; author?: string | null; status: BookStatus
      cover_emoji?: string; started_at?: string | null; finished_at?: string | null; favorite_quote?: string | null
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('books')
        .insert({ ...book, user_id: user!.id, cover_emoji: book.cover_emoji ?? '📚' })
        .select().single()
      if (error) throw error
      return data as Book
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  })
}

export function useUpdateBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...fields }: Partial<Book> & { id: string }) => {
      const { error } = await supabase.from('books').update(fields).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  })
}

export function useDeleteBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('books').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['books'] }),
  })
}

// ─── Vocabulary ───────────────────────────────────────────────
export function useVocabulary() {
  return useQuery({
    queryKey: ['vocabulary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as VocabWord[]
    },
  })
}

export function useAddWord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (word: { word: string; definition?: string | null; source?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('vocabulary')
        .insert({ ...word, user_id: user!.id })
        .select().single()
      if (error) throw error
      return data as VocabWord
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vocabulary'] }),
  })
}

export function useDeleteWord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vocabulary').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vocabulary'] }),
  })
}
