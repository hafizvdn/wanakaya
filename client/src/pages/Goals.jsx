import { useState } from 'react'
import Layout from '../components/ui/Layout.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import GoalCard from '../components/goals/GoalCard.jsx'
import GoalForm from '../components/goals/GoalForm.jsx'
import { useGoals } from '../hooks/useGoals.js'

export default function Goals() {
  const { goals, loading, createGoal, updateGoal, removeGoal } = useGoals()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

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
                <GoalCard key={g.id} goal={g} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          : <p className="text-gray-400 text-sm text-center py-16">No goals yet. Set one to start saving.</p>
      }

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit goal' : 'New goal'}>
        <GoalForm initial={editing} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
    </Layout>
  )
}
