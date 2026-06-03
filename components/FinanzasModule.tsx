'use client'

import { useState } from 'react'
import { PlusCircle, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  useTransactions,
  useMonthSummary,
  useAddTransaction,
  useDeleteTransaction,
} from '@/hooks/useFinanzas'
import type { TransactionCategory, TransactionType } from '@/lib/types'

const CATEGORIES: TransactionCategory[] = [
  'Trabajo', 'Comida', 'Transporte', 'Salud', 'Ocio', 'Ropa', 'Hogar', 'Otro',
]

/* Nido palette — cohesive with design system */
const CATEGORY_COLORS: Record<string, string> = {
  Trabajo:    '#dc6b84',
  Comida:     '#d4945a',
  Transporte: '#b8a9d9',
  Salud:      '#6bab7e',
  Ocio:       '#9a8cbf',
  Ropa:       '#c24f6a',
  Hogar:      '#4e8a5f',
  Otro:       '#c4a8b2',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)
}

function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(month: string) {
  const [year, mon] = month.split('-')
  return new Date(parseInt(year), parseInt(mon) - 1, 1).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  })
}

// ─── Summary Cards ───────────────────────────────────────────
function SummaryCards({ month }: { month: string }) {
  const summary = useMonthSummary(month)
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <div className="card p-3 text-center">
        <div className="w-7 h-7 rounded-lg bg-nido-sage-pale flex items-center justify-center mx-auto mb-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-nido-sage-deep" />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-0.5">Ingresos</p>
        <p className="text-xs font-bold text-nido-sage-deep truncate">
          {formatCurrency(summary.totalIncome)}
        </p>
      </div>
      <div className="card p-3 text-center">
        <div className="w-7 h-7 rounded-lg bg-nido-rose-pale flex items-center justify-center mx-auto mb-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-nido-rose" />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-0.5">Gastos</p>
        <p className="text-xs font-bold text-nido-rose truncate">
          {formatCurrency(summary.totalExpense)}
        </p>
      </div>
      <div className="card p-3 text-center">
        <div className="w-7 h-7 rounded-lg bg-nido-lavender-pale flex items-center justify-center mx-auto mb-1.5">
          <Wallet className="w-3.5 h-3.5 text-nido-lavender-deep" />
        </div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-0.5">Balance</p>
        <p className={`text-xs font-bold truncate ${
          summary.balance >= 0 ? 'text-nido-sage-deep' : 'text-nido-rose'
        }`}>
          {formatCurrency(summary.balance)}
        </p>
      </div>
    </div>
  )
}

// ─── Chart ───────────────────────────────────────────────────
function FinanceChart({ month }: { month: string }) {
  const summary = useMonthSummary(month)
  const chartData = Object.entries(summary.byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) return null

  return (
    <div className="card p-4 mb-4">
      <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-3">
        Gastos por categoría
      </p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: '#c4a8b2', fontFamily: 'inherit' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#c4a8b2', fontFamily: 'inherit' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => formatCurrency(typeof value === 'number' ? value : 0)}
            contentStyle={{
              borderRadius: 14,
              fontSize: 12,
              border: '1px solid #f9dde4',
              boxShadow: '0 4px 16px -4px rgba(220,107,132,0.18)',
              background: '#fefafb',
              color: '#2c1a22',
            }}
            cursor={{ fill: 'rgba(220,107,132,0.06)' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.name}
                fill={CATEGORY_COLORS[entry.name] ?? '#c4a8b2'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Add Transaction Form ─────────────────────────────────────
function TransactionForm({ onClose }: { onClose: () => void }) {
  const addTx = useAddTransaction()
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense' as TransactionType,
    category: 'Otro' as TransactionCategory,
    date: new Date().toISOString().split('T')[0],
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount) return
    await addTx.mutateAsync({ ...form, amount: parseFloat(form.amount) })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-4 space-y-3 animate-scale-in">
      <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist">
        Nuevo movimiento
      </p>

      {/* Tipo */}
      <div className="flex gap-2">
        {(['income', 'expense'] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm({ ...form, type: t })}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              form.type === t
                ? t === 'income'
                  ? 'bg-nido-sage text-white shadow-[0_2px_8px_-2px_rgba(107,171,126,0.45)]'
                  : 'bg-nido-rose text-white shadow-[0_2px_8px_-2px_rgba(220,107,132,0.45)]'
                : 'bg-nido-linen text-nido-mauve'
            }`}
          >
            {t === 'income' ? '+ Ingreso' : '− Gasto'}
          </button>
        ))}
      </div>

      <input
        className="input"
        placeholder="Descripción"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />

      <input
        className="input"
        type="number"
        placeholder="Monto"
        min="0"
        step="0.01"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        required
      />

      <select
        className="input"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value as TransactionCategory })}
      >
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <input
        className="input"
        type="date"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        required
      />

      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={addTx.isPending} className="btn-primary flex-1">
          {addTx.isPending ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

// ─── Transaction List ─────────────────────────────────────────
function TransactionList({ month }: { month: string }) {
  const { data = [], isLoading } = useTransactions(month)
  const deleteTx = useDeleteTransaction()

  if (isLoading) {
    return <div className="text-center py-10 text-nido-mist text-sm">Cargando...</div>
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-nido-mist text-sm">
        Sin movimientos este mes
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((tx, i) => (
        <div
          key={tx.id}
          className="card flex items-stretch overflow-hidden animate-fade-up"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {/* Left color accent strip */}
          <span
            className="w-1.5 shrink-0"
            style={{ background: CATEGORY_COLORS[tx.category] ?? '#c4a8b2' }}
          />
          <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-nido-ink truncate">{tx.description}</p>
              <p className="text-xs text-nido-mist mt-0.5">
                {tx.category} · {new Date(tx.date + 'T12:00:00').toLocaleDateString('es', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
            <span className={`text-sm font-semibold shrink-0 ${
              tx.type === 'income' ? 'text-nido-sage-deep' : 'text-nido-rose'
            }`}>
              {tx.type === 'income' ? '+' : '−'}
              {formatCurrency(Number(tx.amount))}
            </span>
            <button
              onClick={() => deleteTx.mutate(tx.id)}
              className="text-nido-mist hover:text-nido-rose transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export function FinanzasModule() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [showForm, setShowForm] = useState(false)

  const prevMonth = () => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const nextMonth = () => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m, 1)
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">Finanzas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary py-2 px-3"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Agregar</span>
        </button>
      </div>

      {/* Month selector */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="text-nido-mist hover:text-nido-rose transition-colors px-2 py-1 text-xl leading-none"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-nido-mauve capitalize">
          {getMonthLabel(month)}
        </span>
        <button
          onClick={nextMonth}
          className="text-nido-mist hover:text-nido-rose transition-colors px-2 py-1 text-xl leading-none"
        >
          ›
        </button>
      </div>

      <SummaryCards month={month} />
      <FinanceChart month={month} />

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}

      <TransactionList month={month} />
    </div>
  )
}
