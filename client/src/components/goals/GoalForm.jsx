import { useState } from 'react'
import { format } from 'date-fns'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { rmToSen } from '../../lib/utils.js'

export default function GoalForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    targetAmount: initial ? (initial.targetAmount / 100).toFixed(2) : '',
    savedAmount: initial ? (initial.savedAmount / 100).toFixed(2) : '0.00',
    deadline: initial?.deadline ? format(new Date(initial.deadline), 'yyyy-MM-dd') : '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Enter a goal name')
    if (!form.targetAmount || isNaN(form.targetAmount)) return setError('Enter a valid target amount')
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        targetAmount: rmToSen(form.targetAmount),
        savedAmount: rmToSen(form.savedAmount || '0'),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      })
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Goal name"
        type="text"
        placeholder="e.g. New Laptop"
        value={form.name}
        onChange={e => set('name', e.target.value)}
      />
      <Input
        label="Target amount (RM)"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={form.targetAmount}
        onChange={e => set('targetAmount', e.target.value)}
      />
      <Input
        label="Already saved (RM)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        value={form.savedAmount}
        onChange={e => set('savedAmount', e.target.value)}
      />
      <Input
        label="Deadline (optional)"
        type="date"
        value={form.deadline}
        onChange={e => set('deadline', e.target.value)}
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
