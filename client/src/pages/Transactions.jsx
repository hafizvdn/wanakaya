import { useState } from 'react'
import Layout from '../components/ui/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import TransactionList from '../components/transactions/TransactionList.jsx'
import TransactionForm from '../components/transactions/TransactionForm.jsx'
import { useTransactions } from '../hooks/useTransactions.js'
import { useCategories } from '../hooks/useCategories.js'
import { useAccounts } from '../hooks/useAccounts.js'

export default function Transactions() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const { transactions, loading, createTransaction, updateTransaction, removeTransaction } = useTransactions({ month, year })
  const { categories } = useCategories()
  const { accounts } = useAccounts()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(t) { setEditing(t); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleSubmit(body) {
    if (editing) await updateTransaction(editing.id, body)
    else await createTransaction(body)
    closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    await removeTransaction(id)
  }

  return (
    <Layout>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
          <div className="flex gap-2 mt-1">
            <select
              className="text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-2 py-1"
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <input
              type="number"
              className="text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-2 py-1 w-20"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            />
          </div>
        </div>
        <Button onClick={openAdd}>+ Add transaction</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading
          ? <p className="text-gray-400 text-sm p-6">Loading…</p>
          : <TransactionList transactions={transactions} onEdit={openEdit} onDelete={handleDelete} />
        }
      </Card>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit transaction' : 'New transaction'}>
        <TransactionForm
          categories={categories}
          accounts={accounts}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </Layout>
  )
}
