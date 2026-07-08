'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type { SleepLog } from '@/lib/types'

const supabase = createClient()

export function useTodaySleep() {
  const today = new Date().toISOString().split('T')[0]
  return useQuery({
    queryKey: ['sleep_today', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('date', today)
        .maybeSingle()
      if (error) throw error
      return data as SleepLog | null
    },
  })
}

export function useSleepLogs() {
  return useQuery({
    queryKey: ['sleep_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)
      if (error) throw error
      return data as SleepLog[]
    },
  })
}

export function useUpsertSleep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ date, quality }: { date: string; quality: number }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('sleep_logs')
        .upsert({ date, quality, user_id: user!.id }, { onConflict: 'user_id,date' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sleep_logs'] })
      qc.invalidateQueries({ queryKey: ['sleep_today'] })
    },
  })
}
