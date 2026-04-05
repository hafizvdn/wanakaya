import { useState } from 'react'
import Layout from '../components/ui/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import CategoryForm from '../components/categories/CategoryForm.jsx'
import { useCategories } from '../hooks/useCategories.js'
import CategoryIcon from '../components/ui/CategoryIcon.jsx'

export default function Categories() {
  const { categories, loading, createCategory, updateCategory, removeCategory } = useCategories()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(c) { setEditing(c); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleSubmit(body) {
    if (editing) await updateCategory(editing.id, body)
    else await createCategory(body)
    closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Transactions using it cannot be deleted.')) return
    try {
      await removeCategory(id)
    } catch (err) {
      alert(String(err))
    }
  }

  const expenses = categories.filter(c => c.type === 'EXPENSE')
  const income = categories.filter(c => c.type === 'INCOME')

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
        <Button onClick={openAdd}>+ Add category</Button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Loading…</p> : (
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Expense</h3>
            {expenses.length
              ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {expenses.map(c => <CategoryChip key={c.id} category={c} onEdit={openEdit} onDelete={handleDelete} />)}
                </div>
              : <p className="text-gray-400 text-sm">No expense categories yet.</p>
            }
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Income</h3>
            {income.length
              ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {income.map(c => <CategoryChip key={c.id} category={c} onEdit={openEdit} onDelete={handleDelete} />)}
                </div>
              : <p className="text-gray-400 text-sm">No income categories yet.</p>
            }
          </section>
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit category' : 'New category'}>
        <CategoryForm initial={editing} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
    </Layout>
  )
}

function CategoryChip({ category, onEdit, onDelete }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="text-brand-600 dark:text-brand-400 flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/20 shrink-0">
        <CategoryIcon name={category.icon} className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{category.name}</p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button onClick={() => onEdit(category)} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Edit</button>
        <button onClick={() => onDelete(category.id)} className="text-xs text-gray-400 hover:text-red-500">Delete</button>
      </div>
    </Card>
  )
}
