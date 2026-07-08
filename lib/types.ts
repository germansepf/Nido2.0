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
  note: string | null
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  month: string
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
  note: string | null
  count: number | null
  created_at: string
}

export type NoteTag = 'personal' | 'trabajo' | 'ideas' | 'salud' | 'capsula'

export interface Note {
  id: string
  user_id: string
  title: string
  body: string | null
  tag: NoteTag
  unlock_date: string | null
  created_at: string
}

export interface SleepLog {
  id: string
  user_id: string
  date: string
  quality: number  // 1=mal, 2=bien, 3=muy bien
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

export type BookStatus = 'leyendo' | 'quiero_leer' | 'leido'

export interface Book {
  id: string
  user_id: string
  title: string
  author: string | null
  status: BookStatus
  started_at: string | null
  finished_at: string | null
  favorite_quote: string | null
  cover_emoji: string
  created_at: string
}

export interface VocabWord {
  id: string
  user_id: string
  word: string
  definition: string | null
  source: string | null
  created_at: string
}

export interface MonthSummary {
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: Record<string, number>
}
