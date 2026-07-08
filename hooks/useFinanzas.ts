'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase'
import type { Transaction, TransactionType, TransactionCategory, MonthSummary, Budget } from '@/lib/types'

const supabase = createClient()

async function fetchTransactions(month: string) {
  const start = `${month}-01`
  const end = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0)
    .toISOString()
    .split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })

  if (error) throw error
  return data as Transaction[]
}

export function useTransactions(month: string) {
  return useQuery({
    queryKey: ['transactions', month],
    queryFn: () => fetchTransactions(month),
  })
}

export function useMonthSummary(month: string): MonthSummary {
  const { data = [] } = useTransactions(month)

  const totalIncome = data
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = data
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const byCategory: Record<string, number> = {}
  data
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + Number(t.amount)
    })

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    byCategory,
  }
}

export function useAddTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tx: {
      description: string
      amount: number
      type: TransactionType
      category: TransactionCategory
      date: string
      note?: string | null
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('transactions')
        .insert({ ...tx, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

// ─── Budgets ──────────────────────────────────────────────────
export function useBudgets(month: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', month)
      if (error) throw error
      return data as Budget[]
    },
  })
}

export function useUpsertBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ category, amount, month }: { category: string; amount: number; month: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('budgets')
        .upsert({ user_id: user!.id, category, amount, month }, { onConflict: 'user_id,category,month' })
      if (error) throw error
    },
    onSuccess: (_, { month }) => qc.invalidateQueries({ queryKey: ['budgets', month] }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useYearSummary() {
  const year = new Date().getFullYear()
  return useQuery({
    queryKey: ['transactions_year', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`)
      if (error) throw error
      const txs = data as { amount: number; type: string }[]
      const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      return { income, expense, balance: income - expense }
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
