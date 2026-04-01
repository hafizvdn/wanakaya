import { useState } from 'react'
import { format } from 'date-fns'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { rmToSen } from '../../lib/utils.js'

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

      {/* Category */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category<span className="text-red-500 ml-0.5">*</span></label>
        <select
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          value={form.categoryId}
          onChange={e => set('categoryId', e.target.value)}
        >
          <option value="">Select…</option>
          {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <Input
        label="Amount (RM)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={form.amount}
        onChange={e => set('amount', e.target.value)}
      />
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
