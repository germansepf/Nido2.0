'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type { Habit, HabitLog } from '@/lib/types'

const supabase = createClient()

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Habit[]
    },
  })
}

export function useHabitLogs(weekDates: string[]) {
  return useQuery({
    queryKey: ['habit_logs', weekDates[0]],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .gte('date', weekDates[0])
        .lte('date', weekDates[weekDates.length - 1])
      if (error) throw error
      return data as HabitLog[]
    },
    enabled: weekDates.length > 0,
  })
}

export function useToggleHabitLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      habitId,
      date,
      isLogged,
      logId,
    }: {
      habitId: string
      date: string
      isLogged: boolean
      logId?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()

      if (isLogged && logId) {
        const { error } = await supabase.from('habit_logs').delete().eq('id', logId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('habit_logs')
          .upsert({ habit_id: habitId, user_id: user!.id, date })
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habit_logs'] })
      qc.invalidateQueries({ queryKey: ['habit_streak'] })
    },
  })
}

export function useUpdateHabitLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, note, count }: { id: string; note?: string | null; count?: number | null }) => {
      const patch: Record<string, unknown> = {}
      if (note !== undefined) patch.note = note || null
      if (count !== undefined) patch.count = count ?? null
      const { error } = await supabase.from('habit_logs').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habit_logs'] })
      qc.invalidateQueries({ queryKey: ['habit_logs_month'] })
    },
  })
}

export function useAddHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('habits')
        .insert({ name, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as Habit
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      qc.invalidateQueries({ queryKey: ['habit_logs'] })
    },
  })
}

export function useStreak(habitId: string) {
  return useQuery({
    queryKey: ['habit_streak', habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('date')
        .eq('habit_id', habitId)
        .order('date', { ascending: false })
        .limit(90)
      if (error) throw error

      const dates = (data as { date: string }[]).map((d) => d.date)
      if (dates.length === 0) return 0

      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i <= dates.length; i++) {
        const expected = new Date(today)
        expected.setDate(expected.getDate() - i)
        const expectedStr = expected.toISOString().split('T')[0]

        if (dates.includes(expectedStr)) {
          streak++
        } else {
          break
        }
      }

      return streak
    },
    enabled: !!habitId,
  })
}

export function useMonthHabitLogs() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - 27)
  const startStr = start.toISOString().split('T')[0]
  const endStr   = today.toISOString().split('T')[0]

  return useQuery({
    queryKey: ['habit_logs_month', startStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .gte('date', startStr)
        .lte('date', endStr)
      if (error) throw error
      return data as HabitLog[]
    },
  })
}

export function getLast28Dates(): string[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (27 - i))
    return d.toISOString().split('T')[0]
  })
}

export function getWeekDates(): string[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - dayOfWeek)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}
