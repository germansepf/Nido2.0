export type TransactionType = 'income' | 'expense'
export type TransactionCategory =
  | 'Trabajo'
  | 'Comida'
  | 'Transporte'
  | 'Salud'
  | 'Ocio'
  | 'Ropa'
  | 'Hogar'
  | 'Otro'

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  date: string
  created_at: string
}

export type TaskType = 'today' | 'pending'

export interface Task {
  id: string
  user_id: string
  text: string
  done: boolean
  time: string | null
  type: TaskType
  created_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  text: string
  date: string
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  created_at: string
}

export type NoteTag = 'personal' | 'trabajo' | 'ideas' | 'salud'

export interface Note {
  id: string
  user_id: string
  title: string
  body: string | null
  tag: NoteTag
  created_at: string
}

export type MoodLabel = 'Bien' | 'Regular' | 'Neutro' | 'Bajo' | 'Difícil'

export interface MoodLog {
  id: string
  user_id: string
  mood: string
  note: string | null
  date: string
  created_at: string
}

export interface MonthSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: Record<string, number>
}
