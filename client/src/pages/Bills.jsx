import { useState, useMemo } from 'react'
import Layout from '../components/ui/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import Input from '../components/ui/Input.jsx'
import { useBills } from '../hooks/useBills.js'
import { formatCurrency, rmToSen } from '../lib/utils.js'

function BillForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    amount: initial ? (initial.amount / 100).toFixed(2) : '',
    dueDay: initial?.dueDay ?? 1,
    icon: initial?.icon ?? '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Enter a bill name')
    if (!form.amount || isNaN(form.amount)) return setError('Enter a valid amount')
    const day = Number(form.dueDay)
    if (!day || day < 1 || day > 28) return setError('Due day must be between 1 and 28')
    setError(null)
    setSaving(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        amount: rmToSen(form.amount),
        dueDay: day,
        icon: form.icon || undefined,
      })
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Bill name" type="text" placeholder="e.g. Umobile, Rent, Spotify" value={form.name} onChange={e => set('name', e.target.value)} />
      <Input label="Amount (RM)" type="number" step="0.01" min="0.01" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} />
      <Input label="Due day of month (1–28)" type="number" min="1" max="28" value={form.dueDay} onChange={e => set('dueDay', e.target.value)} />
      <Input label="Icon (optional)" type="text" placeholder="emoji, e.g. 📱" value={form.icon} onChange={e => set('icon', e.target.value)} />

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving…' : initial ? 'Update' : 'Add'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function Bills() {
  const { bills, loading, createBill, updateBill, removeBill } = useBills()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(b) { setEditing(b); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleSubmit(body) {
    if (editing) await updateBill(editing.id, body)
    else await createBill(body)
    closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this bill reminder?')) return
    await removeBill(id)
  }

  const today = new Date().getDate()

  const { upcoming, overdue } = useMemo(() => {
    const upcoming = bills.filter(b => b.dueDay >= today)
    const overdue = bills.filter(b => b.dueDay < today)
    return { upcoming, overdue }
  }, [bills, today])

  const totalMonthly = bills.reduce((sum, b) => sum + b.amount, 0)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recurring Bills</h2>
          {!loading && bills.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monthly total: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(totalMonthly)}</span></p>
          )}
        </div>
        <Button onClick={openAdd}>+ Add bill</Button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Loading…</p> : bills.length ? (
        <div className="flex flex-col gap-6">
          {overdue.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">⚠ Overdue this month</h3>
              <div className="flex flex-col gap-2">
                {overdue.map(b => <BillRow key={b.id} bill={b} overdue onEdit={openEdit} onDelete={handleDelete} />)}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming</h3>
              <div className="flex flex-col gap-2">
                {upcoming.map(b => <BillRow key={b.id} bill={b} onEdit={openEdit} onDelete={handleDelete} />)}
              </div>
            </section>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-16">No recurring bills yet. Add things like rent, subscriptions, and utilities.</p>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit bill' : 'New recurring bill'}>
        <BillForm initial={editing} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
    </Layout>
  )
}

function BillRow({ bill, overdue, onEdit, onDelete }) {
  const today = new Date().getDate()
  const daysLeft = bill.dueDay - today

  return (
    <Card className={`flex items-center gap-4 py-3.5 px-4 ${overdue ? 'border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30' : ''}`}>
      <span className="text-2xl">{bill.icon ?? '📄'}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white">{bill.name}</p>
        <p className="text-xs text-gray-400">
          Due on the {bill.dueDay}{ordinal(bill.dueDay)} of every month
          {!overdue && daysLeft === 0 && <span className="ml-2 text-orange-500 font-medium">· Due today!</span>}
          {!overdue && daysLeft > 0 && <span className="ml-2 text-gray-400">· in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>}
          {overdue && <span className="ml-2 text-red-500 font-medium">· {Math.abs(daysLeft)} day{Math.abs(daysLeft) !== 1 ? 's' : ''} ago</span>}
        </p>
      </div>
      <p className={`font-bold text-lg ${overdue ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{formatCurrency(bill.amount)}</p>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onEdit(bill)} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1">Edit</button>
        <button onClick={() => onDelete(bill.id)} className="text-xs text-gray-400 hover:text-red-500 px-2 py-1">Delete</button>
      </div>
    </Card>
  )
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
