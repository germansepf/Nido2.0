'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type { MoodLog } from '@/lib/types'

const supabase = createClient()

export function useMoodLogs() {
  return useQuery({
    queryKey: ['mood_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)
      if (error) throw error
      return data as MoodLog[]
    },
  })
}

export function useTodayMood() {
  const today = new Date().toISOString().split('T')[0]
  return useQuery({
    queryKey: ['mood_today', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('date', today)
        .maybeSingle()
      if (error) throw error
      return data as MoodLog | null
    },
  })
}

export function useUpsertMood() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (mood: { mood: string; note: string; date: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('mood_logs')
        .upsert({ ...mood, user_id: user!.id }, { onConflict: 'user_id,date' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mood_logs'] })
      qc.invalidateQueries({ queryKey: ['mood_today'] })
    },
  })
}
