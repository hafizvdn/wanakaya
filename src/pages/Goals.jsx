import { useState } from 'react'
import { format } from 'date-fns'
import Layout from '../components/ui/Layout.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import Input from '../components/ui/Input.jsx'
import GoalCard from '../components/goals/GoalCard.jsx'
import GoalForm from '../components/goals/GoalForm.jsx'
import { useGoals } from '../hooks/useGoals.js'
import { formatCurrency, rmToSen } from '../lib/utils.js'

/** Modal for adding a deposit or withdrawal to a goal */
function ContributionModal({ goal, onSubmit, onClose }) {
  const [mode, setMode] = useState('deposit') // 'deposit' | 'withdrawal'
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || isNaN(amount) || Number(amount) <= 0) return setError('Enter a valid amount')
    const sen = rmToSen(amount)
    const signed = mode === 'withdrawal' ? -sen : sen
    if (mode === 'withdrawal' && sen > goal.savedAmount) {
      return setError(`Cannot withdraw more than ${formatCurrency(goal.savedAmount)} saved`)
    }
    setError(null)
    setSaving(true)
    try {
      await onSubmit({ amount: signed, note: note || undefined, date: new Date(date).toISOString() })
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        {['deposit', 'withdrawal'].map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
              mode === m
                ? m === 'deposit' ? 'bg-brand-600 text-white border-brand-600' : 'bg-red-500 text-white border-red-500'
                : 'border-gray-200 text-gray-500 dark:border-gray-600 dark:text-gray-400'
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <Input
        label={`Amount (RM) — ${mode}`}
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />
      <Input
        label="Note (optional)"
        type="text"
        placeholder="e.g. Monthly savings transfer"
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Saving…' : mode === 'deposit' ? '+ Add funds' : '− Withdraw'}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

/** Shows recent contributions for a goal with a delete button */
function ContributionHistory({ goal, onDelete }) {
  const contributions = goal.contributions ?? []
  if (!contributions.length) return <p className="text-gray-400 text-sm text-center py-4">No contributions yet.</p>

  return (
    <ul className="flex flex-col gap-2">
      {contributions.map(c => (
        <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
          <div className="min-w-0">
            <p className={`font-semibold ${c.amount >= 0 ? 'text-brand-600' : 'text-red-500'}`}>
              {c.amount >= 0 ? '+' : ''}{formatCurrency(c.amount)}
            </p>
            <p className="text-xs text-gray-400">{format(new Date(c.date), 'dd MMM yyyy')}{c.note ? ` · ${c.note}` : ''}</p>
          </div>
          <button
            onClick={() => onDelete(c.id)}
            className="text-xs text-gray-400 hover:text-red-500 shrink-0 px-2 py-1"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function Goals() {
  const { goals, loading, createGoal, updateGoal, removeGoal, addContribution, removeContribution } = useGoals()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [contributionGoal, setContributionGoal] = useState(null)
  const [historyGoal, setHistoryGoal] = useState(null)

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(g) { setEditing(g); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleSubmit(body) {
    if (editing) await updateGoal(editing.id, body)
    else await createGoal(body)
    closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this goal?')) return
    await removeGoal(id)
  }

  async function handleContribution(body) {
    await addContribution(contributionGoal.id, body)
    setContributionGoal(null)
  }

  async function handleDeleteContribution(goalId, contributionId) {
    if (!confirm('Remove this contribution?')) return
    const updated = await removeContribution(goalId, contributionId)
    // keep history modal open with updated data
    setHistoryGoal(updated)
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h2>
        <Button onClick={openAdd}>+ Add goal</Button>
      </div>

      {loading
        ? <p className="text-gray-400 text-sm">Loading…</p>
        : goals.length
          ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-3">
              {goals.map(g => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onAddFunds={() => setContributionGoal(g)}
                  onHistory={() => setHistoryGoal(g)}
                />
              ))}
            </div>
          : <p className="text-gray-400 text-sm text-center py-16">No goals yet. Set one to start saving.</p>
      }

      {/* Create / edit goal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit goal' : 'New goal'}>
        <GoalForm initial={editing} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>

      {/* Add funds / withdraw */}
      <Modal
        open={!!contributionGoal}
        onClose={() => setContributionGoal(null)}
        title={`Add funds — ${contributionGoal?.name}`}
      >
        {contributionGoal && (
          <ContributionModal
            goal={contributionGoal}
            onSubmit={handleContribution}
            onClose={() => setContributionGoal(null)}
          />
        )}
      </Modal>

      {/* Contribution history */}
      <Modal
        open={!!historyGoal}
        onClose={() => setHistoryGoal(null)}
        title={`History — ${historyGoal?.name}`}
      >
        {historyGoal && (
          <ContributionHistory
            goal={historyGoal}
            onDelete={id => handleDeleteContribution(historyGoal.id, id)}
          />
        )}
      </Modal>
    </Layout>
  )
}