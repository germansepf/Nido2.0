'use client'

import { useState } from 'react'
import { PlusCircleIcon, TrashIcon, TrendUpIcon, TrendDownIcon, WalletIcon, TargetIcon } from '@phosphor-icons/react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import {
  useTransactions,
  useMonthSummary,
  useYearSummary,
  useAddTransaction,
  useDeleteTransaction,
  useBudgets,
  useUpsertBudget,
  useDeleteBudget,
} from '@/hooks/useFinanzas'
import type { TransactionCategory, TransactionType } from '@/lib/types'

const CATEGORIES: TransactionCategory[] = [
  'Trabajo', 'Comida', 'Transporte', 'Salud', 'Ocio', 'Ropa', 'Hogar', 'Otro',
]

const CATEGORY_META: Record<string, { color: string; icon: string }> = {
  Trabajo:    { color: '#c4786a', icon: '💼' },
  Comida:     { color: '#c09040', icon: '🍽️' },
  Transporte: { color: '#b0a090', icon: '🚌' },
  Salud:      { color: '#7a9460', icon: '💊' },
  Ocio:       { color: '#8a7868', icon: '🎬' },
  Ropa:       { color: '#a0624e', icon: '👗' },
  Hogar:      { color: '#5a7848', icon: '🏠' },
  Otro:       { color: '#c0aa98', icon: '📦' },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0,
  }).format(amount)
}
function formatCompact(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', minimumFractionDigits: 0, notation: 'compact',
  }).format(amount)
}

function getCurrentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(month: string) {
  const [year, mon] = month.split('-')
  return new Date(parseInt(year), parseInt(mon) - 1, 1).toLocaleDateString('es', {
    month: 'long', year: 'numeric',
  })
}

// ─── Summary Cards ────────────────────────────────────────────
function SummaryCards({ month }: { month: string }) {
  const summary = useMonthSummary(month)
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[
        { icon: TrendUpIcon,   bg: 'bg-nido-sage-pale',     ic: 'text-nido-sage-deep',     label: 'Ingresos', value: summary.totalIncome,  color: 'text-nido-sage-deep' },
        { icon: TrendDownIcon, bg: 'bg-nido-rose-pale',     ic: 'text-nido-rose',          label: 'Gastos',   value: summary.totalExpense, color: 'text-nido-rose' },
        { icon: WalletIcon,       bg: 'bg-nido-lavender-pale', ic: 'text-nido-lavender-deep', label: 'Balance',  value: summary.balance,      color: summary.balance >= 0 ? 'text-nido-sage-deep' : 'text-nido-rose' },
      ].map(({ icon: Icon, bg, ic, label, value, color }) => (
        <div key={label} className="card p-3 text-center animate-fade-up">
          <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1.5`}>
            <Icon size={15} weight="duotone" className={ic} />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-0.5">{label}</p>
          <p className={`text-xs font-bold truncate ${color}`}>{formatCompact(value)}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Year Summary ─────────────────────────────────────────────
function YearCard() {
  const { data } = useYearSummary()
  if (!data) return null
  return (
    <div className="card p-4 mb-4 animate-fade-up">
      <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-2.5">
        {new Date().getFullYear()} · Acumulado anual
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[9px] text-nido-mist mb-0.5">Ingresos</p>
          <p className="text-xs font-semibold text-nido-sage-deep">{formatCompact(data.income)}</p>
        </div>
        <div>
          <p className="text-[9px] text-nido-mist mb-0.5">Gastos</p>
          <p className="text-xs font-semibold text-nido-rose">{formatCompact(data.expense)}</p>
        </div>
        <div>
          <p className="text-[9px] text-nido-mist mb-0.5">Balance</p>
          <p className={`text-xs font-semibold ${data.balance >= 0 ? 'text-nido-sage-deep' : 'text-nido-rose'}`}>
            {formatCompact(data.balance)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Savings Goal ─────────────────────────────────────────────
function SavingsGoal({ balance }: { balance: number }) {
  const [goal, setGoal] = useState(() => {
    if (typeof window === 'undefined') return 0
    return Number(localStorage.getItem('nido-saving-goal') ?? 0)
  })
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')

  function saveGoal() {
    const v = parseFloat(input)
    if (!isNaN(v) && v > 0) {
      setGoal(v)
      localStorage.setItem('nido-saving-goal', String(v))
    }
    setEditing(false)
    setInput('')
  }

  if (!goal && !editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="card-lift card w-full p-3 mb-4 flex items-center gap-2 text-nido-mist hover:text-nido-amber transition-colors"
      >
        <TargetIcon className="w-4 h-4 shrink-0" />
        <span className="text-xs">Establecer meta de ahorro mensual</span>
      </button>
    )
  }

  if (editing) {
    return (
      <div className="card p-3 mb-4 flex gap-2 animate-scale-in">
        <input
          className="input flex-1"
          type="number"
          placeholder="Meta de ahorro (ARS)"
          value={input}
          onChange={e => setInput(e.target.value)}
          autoFocus
        />
        <button onClick={saveGoal} className="btn-primary px-3 py-2">Guardar</button>
        <button onClick={() => setEditing(false)} className="btn-secondary px-3 py-2">✕</button>
      </div>
    )
  }

  const pct = Math.min(100, goal > 0 ? Math.round((balance / goal) * 100) : 0)
  const reached = balance >= goal

  return (
    <div className="card p-4 mb-4 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <TargetIcon className="w-3.5 h-3.5 text-nido-amber" />
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-nido-mist">Meta mensual</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${reached ? 'text-nido-sage-deep' : 'text-nido-amber'}`}>
            {formatCompact(balance)} / {formatCompact(goal)}
          </span>
          <button onClick={() => { setEditing(true); setInput(String(goal)) }} className="text-[10px] text-nido-mist hover:text-nido-mauve transition-colors">
            editar
          </button>
        </div>
      </div>
      <div className="h-2.5 bg-nido-linen rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${reached ? 'bg-nido-sage' : 'bg-nido-amber'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {reached && (
        <p className="text-[10px] text-nido-sage-deep font-medium mt-1.5 text-center animate-pop">
          ¡Meta alcanzada! 🎉
        </p>
      )}
    </div>
  )
}

// ─── Charts ──────────────────────────────────────────────────
function FinanceChart({ month }: { month: string }) {
  const summary = useMonthSummary(month)
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  const chartData = Object.entries(summary.byCategory)
    .map(([name, value]) => ({ name, value, color: CATEGORY_META[name]?.color ?? '#c0aa98', icon: CATEGORY_META[name]?.icon ?? '📦' }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) return null

  return (
    <div className="card p-4 mb-4 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist">
          Gastos por categoría
        </p>
        <div className="flex gap-1">
          {(['bar', 'pie'] as const).map(t => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-medium transition-all ${
                chartType === t ? 'bg-nido-rose-pale text-nido-rose-deep' : 'text-nido-mist'
              }`}
            >
              {t === 'bar' ? 'Barras' : 'Torta'}
            </button>
          ))}
        </div>
      </div>

      {chartType === 'bar' ? (
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -22, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#c0aa98', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#c0aa98', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => formatCurrency(typeof v === 'number' ? v : 0)}
              contentStyle={{ borderRadius: 14, fontSize: 12, border: '1px solid #f0ddd6', background: '#fdf9f2', color: '#2c1e14', boxShadow: '0 4px 16px -4px rgba(196,120,106,0.18)' }}
              cursor={{ fill: 'rgba(196,120,106,0.06)' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {chartData.map(e => <Cell key={e.name} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={70}
              innerRadius={35}
              paddingAngle={2}
            >
              {chartData.map(e => <Cell key={e.name} fill={e.color} />)}
            </Pie>
            <Tooltip
              formatter={(v) => formatCurrency(typeof v === 'number' ? v : 0)}
              contentStyle={{ borderRadius: 14, fontSize: 12, border: '1px solid #f0ddd6', background: '#fdf9f2', color: '#2c1e14' }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, color: '#88685a' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ─── Budget Section ───────────────────────────────────────────
function BudgetSection({ month, byCategory }: { month: string; byCategory: Record<string, number> }) {
  const { data: budgets = [] } = useBudgets(month)
  const upsert = useUpsertBudget()
  const del    = useDeleteBudget()

  const [editing, setEditing]   = useState<string | null>(null)
  const [input,   setInput]     = useState('')
  const [showAdd, setShowAdd]   = useState(false)
  const [addCat,  setAddCat]    = useState<TransactionCategory>('Otro')

  function saveNew() {
    const v = parseFloat(input)
    if (isNaN(v) || v <= 0) return
    upsert.mutate({ category: addCat, amount: v, month })
    setInput(''); setShowAdd(false)
  }

  function saveEdit(id: string, category: string) {
    const v = parseFloat(input)
    if (!isNaN(v) && v > 0) upsert.mutate({ category, amount: v, month })
    setEditing(null); setInput('')
  }

  if (budgets.length === 0 && !showAdd) {
    return (
      <button onClick={() => setShowAdd(true)}
        className="card-lift card w-full p-3 mb-4 flex items-center gap-2 text-nido-mist hover:text-nido-amber transition-colors">
        <span className="text-sm">🎯</span>
        <span className="text-xs">Configurar presupuesto por categoría</span>
      </button>
    )
  }

  return (
    <div className="card p-4 mb-4 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist">Presupuesto</p>
        <button onClick={() => setShowAdd(v => !v)} className="text-[9px] text-nido-mist hover:text-nido-amber transition-colors">
          + Agregar
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2 mb-3 animate-fade-up">
          <select className="input flex-1 text-xs py-1.5" value={addCat}
            onChange={e => setAddCat(e.target.value as TransactionCategory)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_META[c]?.icon} {c}</option>)}
          </select>
          <input type="number" className="input w-24 text-xs py-1.5" placeholder="Monto" value={input}
            onChange={e => setInput(e.target.value)} />
          <button onClick={saveNew} className="btn-primary py-1.5 px-3 text-xs">OK</button>
        </div>
      )}

      <div className="space-y-2.5">
        {budgets.map(b => {
          const spent   = byCategory[b.category] ?? 0
          const pct     = Math.min(100, b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0)
          const isWarn  = pct >= 80 && pct < 100
          const isOver  = pct >= 100
          const barColor = isOver ? 'bg-nido-rose' : isWarn ? 'bg-nido-amber' : 'bg-nido-sage'
          const meta    = CATEGORY_META[b.category]
          return (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{meta?.icon ?? '📦'}</span>
                  <span className="text-[10px] font-medium text-nido-ink">{b.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  {editing === b.id ? (
                    <>
                      <input type="number" className="w-20 text-[9px] border border-nido-rose-pale rounded-lg px-1.5 py-0.5 bg-nido-cream focus:outline-none"
                        value={input} onChange={e => setInput(e.target.value)} autoFocus />
                      <button onClick={() => saveEdit(b.id, b.category)} className="text-[9px] text-nido-sage-deep">✓</button>
                      <button onClick={() => { setEditing(null); setInput('') }} className="text-[9px] text-nido-mist">✕</button>
                    </>
                  ) : (
                    <>
                      <span className={`text-[9px] font-medium ${isOver ? 'text-nido-rose' : isWarn ? 'text-nido-amber' : 'text-nido-mist'}`}>
                        {formatCompact(spent)} / {formatCompact(b.amount)}
                      </span>
                      <button onClick={() => { setEditing(b.id); setInput(String(b.amount)) }}
                        className="text-[9px] text-nido-mist hover:text-nido-mauve">✎</button>
                      <button onClick={() => del.mutate(b.id)} className="text-[9px] text-nido-mist hover:text-nido-rose">✕</button>
                    </>
                  )}
                </div>
              </div>
              <div className="h-1.5 bg-nido-linen rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
              {isOver && <p className="text-[8px] text-nido-rose mt-0.5">¡Presupuesto superado!</p>}
            </div>
          )
        })}
      </div>
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
    note: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount) return
    await addTx.mutateAsync({ ...form, amount: parseFloat(form.amount), note: form.note.trim() || null })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 mb-4 space-y-3 animate-slide-up">
      <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist">Nuevo movimiento</p>

      <div className="flex gap-2">
        {(['income', 'expense'] as TransactionType[]).map((t) => (
          <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              form.type === t
                ? t === 'income'
                  ? 'bg-nido-sage text-white shadow-[0_2px_8px_-2px_rgba(122,148,96,0.45)]'
                  : 'bg-nido-rose text-white shadow-[0_2px_8px_-2px_rgba(196,120,106,0.45)]'
                : 'bg-nido-linen text-nido-mauve'
            }`}>
            {t === 'income' ? '+ Ingreso' : '− Gasto'}
          </button>
        ))}
      </div>

      <input className="input" placeholder="Descripción" value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })} required />
      <input className="input" type="number" placeholder="Monto" min="0" step="0.01" value={form.amount}
        onChange={e => setForm({ ...form, amount: e.target.value })} required />

      <select className="input" value={form.category}
        onChange={e => setForm({ ...form, category: e.target.value as TransactionCategory })}>
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{CATEGORY_META[c]?.icon} {c}</option>
        ))}
      </select>

      <input className="input" type="date" value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })} required />

      <input className="input" placeholder="Nota (opcional)" value={form.note}
        onChange={e => setForm({ ...form, note: e.target.value })} />

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
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-16" style={{ animationDelay: `${i * 80}ms` }} />)}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-2">💸</p>
        <p className="text-nido-mauve text-sm">Sin movimientos este mes</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((tx, i) => {
        const meta = CATEGORY_META[tx.category]
        return (
          <div key={tx.id} className="card-lift card flex items-stretch overflow-hidden animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}>
            <span className="w-1.5 shrink-0" style={{ background: meta?.color ?? '#c0aa98' }} />
            <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
              <span className="text-lg shrink-0 leading-none">{meta?.icon ?? '📦'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-nido-ink truncate">{tx.description}</p>
                <p className="text-xs text-nido-mist mt-0.5">
                  {tx.category} · {new Date(tx.date + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                </p>
                {tx.note && <p className="text-[9.5px] text-nido-mauve mt-0.5 italic truncate">{tx.note}</p>}
              </div>
              <span className={`text-sm font-semibold shrink-0 ${tx.type === 'income' ? 'text-nido-sage-deep' : 'text-nido-rose'}`}>
                {tx.type === 'income' ? '+' : '−'}{formatCompact(Number(tx.amount))}
              </span>
              <button onClick={() => deleteTx.mutate(tx.id)} className="text-nido-mist hover:text-nido-rose transition-colors shrink-0">
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export function FinanzasModule() {
  const [month, setMonth] = useState(getCurrentMonth())
  const [showForm, setShowForm] = useState(false)
  const summary = useMonthSummary(month)

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
    <div className="animate-fade-up">
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-2xl text-nido-ink">💰 Finanzas</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary py-2 px-3">
          <PlusCircleIcon size={16} />
          <span>Agregar</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-nido-mist hover:text-nido-rose transition-colors px-2 py-1 text-xl leading-none">‹</button>
        <span className="text-sm font-medium text-nido-mauve capitalize">{getMonthLabel(month)}</span>
        <button onClick={nextMonth} className="text-nido-mist hover:text-nido-rose transition-colors px-2 py-1 text-xl leading-none">›</button>
      </div>

      <SummaryCards month={month} />
      <SavingsGoal balance={summary.balance} />
      <BudgetSection month={month} byCategory={summary.byCategory} />
      <FinanceChart month={month} />
      <YearCard />

      {showForm && <TransactionForm onClose={() => setShowForm(false)} />}

      <p className="text-[9px] font-bold uppercase tracking-widest text-nido-mist mb-3">Movimientos</p>
      <TransactionList month={month} />
    </div>
  )
}
