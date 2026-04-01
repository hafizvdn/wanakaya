import { useState, useMemo } from 'react'
import Layout from '../components/ui/Layout.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import BudgetCard from '../components/budgets/BudgetCard.jsx'
import BudgetForm from '../components/budgets/BudgetForm.jsx'
import { useBudgets } from '../hooks/useBudgets.js'
import { useCategories } from '../hooks/useCategories.js'
import { useTransactions } from '../hooks/useTransactions.js'

export default function Budgets() {
  const { budgets, loading, createBudget, updateBudget, removeBudget } = useBudgets()
  const { categories } = useCategories()
  // Fetch ALL transactions so we can match each budget to its own month/year
  const { transactions } = useTransactions({})

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  // Key: `${categoryId}-${month}-${year}` → total sen spent
  const spentByBudgetKey = useMemo(() => {
    const map = {}
    for (const t of transactions) {
      if (t.type !== 'EXPENSE') continue
      const d = new Date(t.date)
      const month = d.getMonth() + 1
      const year = d.getFullYear()
      const key = `${t.categoryId}-${month}-${year}`
      map[key] = (map[key] ?? 0) + t.amount
    }
    return map
  }, [transactions])

  function spentForBudget(b) {
    const key = `${b.categoryId}-${b.month}-${b.year}`
    return spentByBudgetKey[key] ?? 0
  }

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(b) { setEditing(b); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleSubmit(body) {
    if (editing) await updateBudget(editing.id, body)
    else await createBudget(body)
    closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this budget?')) return
    await removeBudget(id)
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h2>
        <Button onClick={openAdd}>+ Add budget</Button>
      </div>

      {loading
        ? <p className="text-gray-400 text-sm">Loading…</p>
        : budgets.length
          ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-3">
              {budgets.map(b => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  spent={spentForBudget(b)}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          : <p className="text-gray-400 text-sm text-center py-16">No budgets yet. Add one to start tracking.</p>
      }

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit budget' : 'New budget'}>
        <BudgetForm
          categories={categories}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </Layout>
  )
}