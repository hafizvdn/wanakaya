import { useState as useReactState } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { rmToSen } from '../../lib/utils.js'

export default function BudgetForm({ categories, initial, onSubmit, onCancel }) {
  const [form, setReactState] = useReactState(() => {
    const now = new Date()
    return {
      categoryId: initial?.categoryId ?? '',
      limitAmount: initial ? (initial.limitAmount / 100).toFixed(2) : '',
      period: initial?.period ?? 'MONTHLY',
      month: initial?.month ?? now.getMonth() + 1,
      year: initial?.year ?? now.getFullYear(),
    }
  })
  const [error, setError] = useReactState(null)
  const [saving, setSaving] = useReactState(false)

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')

  function set(key, value) {
    setReactState(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.categoryId) return setError('Please select a category')
    if (!form.limitAmount || isNaN(form.limitAmount)) return setError('Enter a valid amount')
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        categoryId: form.categoryId,
        limitAmount: rmToSen(form.limitAmount),
        period: form.period,
        month: Number(form.month),
        year: Number(form.year),
      })
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
        <select
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          value={form.categoryId}
          onChange={e => set('categoryId', e.target.value)}
        >
          <option value="">Select…</option>
          {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <Input
        label="Limit (RM)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={form.limitAmount}
        onChange={e => set('limitAmount', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Month"
          type="number"
          min="1"
          max="12"
          value={form.month}
          onChange={e => set('month', e.target.value)}
        />
        <Input
          label="Year"
          type="number"
          min="2000"
          value={form.year}
          onChange={e => set('year', e.target.value)}
        />
      </div>

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
