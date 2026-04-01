import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import CategoryIcon from '../ui/CategoryIcon.jsx'
import { rmToSen } from '../../lib/utils.js'

/** Inline calculator for entering amounts with mouse clicks */
function AmountCalculator({ value, onChange }) {
  const [showPad, setShowPad] = useState(false)
  const [expr, setExpr] = useState(value || '')
  const ref = useRef(null)

  // Sync outward value → expr when parent resets form
  useEffect(() => {
    if (!showPad) setExpr(value || '')
  }, [value, showPad])

  // Close pad on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        commitAndClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [expr])

  function commitAndClose() {
    const result = evaluate(expr)
    onChange(result)
    setShowPad(false)
  }

  function evaluate(raw) {
    try {
      // allow simple +−×÷ chains
      const sanitized = raw.replace(/×/g, '*').replace(/÷/g, '/')
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + sanitized + ')')()
      if (typeof result !== 'number' || !isFinite(result) || result < 0) return raw
      return parseFloat(result.toFixed(2)).toString()
    } catch {
      return raw
    }
  }

  function press(key) {
    if (key === 'C') {
      setExpr('')
      onChange('')
      return
    }
    if (key === '⌫') {
      const next = expr.slice(0, -1)
      setExpr(next)
      return
    }
    if (key === '=') {
      const result = evaluate(expr)
      setExpr(result)
      onChange(result)
      return
    }
    const next = expr + key
    setExpr(next)
  }

  const rows = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['C', '0', '.', '+'],
    ['⌫', '00', '='],
  ]

  const isOp = k => ['÷', '×', '-', '+', '='].includes(k)
  const isDanger = k => k === 'C'
  const isWide = k => k === '='

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (RM)</label>

      {/* Display / text input */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={showPad ? expr : value}
          onFocus={() => { setExpr(value || ''); setShowPad(true) }}
          onChange={e => { setExpr(e.target.value); onChange(e.target.value) }}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="button"
          onClick={() => { setExpr(value || ''); setShowPad(p => !p) }}
          className={`rounded-lg border px-2.5 py-2 text-sm transition ${showPad ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-brand-500 hover:text-brand-600'}`}
          title="Toggle calculator"
        >
          🖩
        </button>
      </div>

      {/* Calculator pad */}
      {showPad && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2 shadow-lg">
          {/* Expression preview */}
          <div className="text-right text-xs text-gray-400 dark:text-gray-500 px-2 pb-1 min-h-[18px] font-mono truncate">
            {expr || '0'}
          </div>
          <div className="flex flex-col gap-1">
            {rows.map((row, ri) => (
              <div key={ri} className="flex gap-1">
                {row.map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => press(key)}
                    className={`
                      flex-1 rounded-lg py-2.5 text-sm font-medium transition active:scale-95
                      ${isWide(key) ? 'col-span-2' : ''}
                      ${key === '='
                        ? 'bg-brand-600 hover:bg-brand-700 text-white'
                        : isOp(key)
                          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 border border-brand-200 dark:border-brand-800'
                          : isDanger(key)
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800'
                            : key === '⌫'
                              ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/40 border border-orange-200 dark:border-orange-800'
                              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }
                    `}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** Custom dropdown that renders real Lucide icons next to category names */
function CategoryDropdown({ categories, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = categories.find(c => c.id === value)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 text-left"
      >
        {selected ? (
          <>
            <CategoryIcon name={selected.icon} className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
            <span className="flex-1 truncate">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-gray-400 dark:text-gray-500">Select…</span>
        )}
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg py-1">
          <li>
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Select…
            </button>
          </li>
          {categories.map(c => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => { onChange(c.id); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${value === c.id ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400' : 'text-gray-800 dark:text-gray-200'}`}
              >
                <CategoryIcon name={c.icon} className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function TransactionForm({ categories, accounts, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    type: initial?.type ?? 'EXPENSE',
    categoryId: initial?.categoryId ?? '',
    accountId: initial?.accountId ?? '',
    amount: initial ? (initial.amount / 100).toFixed(2) : '',
    note: initial?.note ?? '',
    date: initial ? format(new Date(initial.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const filteredCategories = categories.filter(c => c.type === form.type)

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.accountId) return setError('Please select a source account')
    if (!form.categoryId) return setError('Please select a category')
    if (!form.amount || isNaN(form.amount)) return setError('Enter a valid amount')
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        type: form.type,
        categoryId: form.categoryId,
        accountId: form.accountId,
        amount: rmToSen(form.amount),
        note: form.note || undefined,
        date: new Date(form.date).toISOString(),
      })
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Type toggle */}
      <div className="flex gap-2">
        {['EXPENSE', 'INCOME'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { set('type', t); set('categoryId', '') }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${form.type === t ? (t === 'INCOME' ? 'bg-brand-600 text-white border-brand-600' : 'bg-red-500 text-white border-red-500') : 'border-gray-200 text-gray-500'}`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Source account — mandatory */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {form.type === 'INCOME' ? 'Deposit into' : 'Pay from'}
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <select
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          value={form.accountId}
          onChange={e => set('accountId', e.target.value)}
        >
          <option value="">Select account…</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.icon ?? '💳'} {a.name}</option>)}
        </select>
      </div>

      {/* Category — custom dropdown with real icons */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Category<span className="text-red-500 ml-0.5">*</span>
        </label>
        <CategoryDropdown
          categories={filteredCategories}
          value={form.categoryId}
          onChange={v => set('categoryId', v)}
        />
      </div>

      <AmountCalculator value={form.amount} onChange={v => set('amount', v)} />
      <Input
        label="Date"
        type="date"
        value={form.date}
        onChange={e => set('date', e.target.value)}
      />
      <Input
        label="Note (optional)"
        type="text"
        placeholder="What was this for?"
        value={form.note}
        onChange={e => set('note', e.target.value)}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Saving…' : initial ? 'Update' : 'Add'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}