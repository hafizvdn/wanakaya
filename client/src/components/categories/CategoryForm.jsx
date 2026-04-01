import { useState } from 'react'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

// 1. Import the professional icons from Lucide
import { 
  Utensils, Car, Home, Pill, Gamepad2, Shirt, Book, 
  Plane, Coins, Briefcase, Gift, Zap, Smartphone, Dumbbell, PawPrint 
} from 'lucide-react'

// 2. Map the string name to the React Component
const ICONS = [
  { id: 'Utensils', Icon: Utensils },
  { id: 'Car', Icon: Car },
  { id: 'Home', Icon: Home },
  { id: 'Pill', Icon: Pill },
  { id: 'Gamepad2', Icon: Gamepad2 },
  { id: 'Shirt', Icon: Shirt },
  { id: 'Book', Icon: Book },
  { id: 'Plane', Icon: Plane },
  { id: 'Coins', Icon: Coins },
  { id: 'Briefcase', Icon: Briefcase },
  { id: 'Gift', Icon: Gift },
  { id: 'Zap', Icon: Zap },
  { id: 'Smartphone', Icon: Smartphone },
  { id: 'Dumbbell', Icon: Dumbbell },
  { id: 'PawPrint', Icon: PawPrint },
]

export default function CategoryForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    type: initial?.type ?? 'EXPENSE',
    icon: initial?.icon ?? '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Enter a category name')
    setError(null)
    setSaving(true)
    try {
      await onSubmit({ name: form.name.trim(), type: form.type, icon: form.icon || undefined })
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        {['EXPENSE', 'INCOME'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => set('type', t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${form.type === t ? (t === 'INCOME' ? 'bg-brand-600 text-white border-brand-600' : 'bg-red-500 text-white border-red-500') : 'border-gray-200 text-gray-500'}`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Input
        label="Category name"
        type="text"
        placeholder="e.g. Food, Transport"
        value={form.name}
        onChange={e => set('name', e.target.value)}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Icon (optional)</label>
        <div className="flex flex-wrap gap-2">
          {/* 3. Render the Lucide icons dynamically */}
          {ICONS.map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => set('icon', form.icon === id ? '' : id)}
              className={`p-2 rounded-lg border transition ${form.icon === id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 text-gray-500 dark:text-gray-400'}`}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
        </div>
        {form.icon && (
          <button type="button" onClick={() => set('icon', '')} className="text-xs text-gray-400 hover:text-gray-600 self-start mt-1">
            Clear icon
          </button>
        )}
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