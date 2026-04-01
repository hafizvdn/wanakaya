import { useState } from 'react'
import Layout from '../components/ui/Layout.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import Input from '../components/ui/Input.jsx'
import AccountIcon from '../components/ui/AccountIcon.jsx'
import { useAccounts } from '../hooks/useAccounts.js'
import { formatCurrency, rmToSen } from '../lib/utils.js'

const TYPE_LABELS = { BANK: 'Bank', CASH: 'Cash', EWALLET: 'E-Wallet', OTHER: 'Other' }

function AccountForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    type: initial?.type ?? 'BANK',
    balance: initial ? (initial.balance / 100).toFixed(2) : '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  function set(key, value) { setForm(prev => ({ ...prev, [key]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Enter an account name')
    if (form.balance === '' || isNaN(form.balance)) return setError('Enter a valid balance')
    setError(null)
    setSaving(true)
    try {
      await onSubmit({ name: form.name.trim(), type: form.type, balance: rmToSen(form.balance) })
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Account name" type="text" placeholder="e.g. Bank Muamalat" value={form.name} onChange={e => set('name', e.target.value)} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TYPE_LABELS).map(([val, label]) => (
            <button key={val} type="button" onClick={() => set('type', val)}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition ${form.type === val ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}>
              <AccountIcon type={val} className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <Input label="Current balance (RM)" type="number" step="0.01" placeholder="0.00" value={form.balance} onChange={e => set('balance', e.target.value)} />

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving…' : initial ? 'Update' : 'Add'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function Accounts() {
  const { accounts, loading, createAccount, updateAccount, removeAccount } = useAccounts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  function openAdd() { setEditing(null); setModalOpen(true) }
  function openEdit(a) { setEditing(a); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }

  async function handleSubmit(body) {
    if (editing) await updateAccount(editing.id, body)
    else await createAccount(body)
    closeModal()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this account?')) return
    await removeAccount(id)
  }

  const total = accounts.reduce((sum, a) => sum + a.balance, 0)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h2>
          {!loading && accounts.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Total: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(total)}</span>
            </p>
          )}
        </div>
        <Button onClick={openAdd}>+ Add account</Button>
      </div>

      {loading ? <p className="text-gray-400 text-sm">Loading…</p> : accounts.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-3">
          {accounts.map(a => (
            <Card key={a.id} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="text-brand-600 dark:text-brand-400 flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-900/20 shrink-0">
                  <AccountIcon type={a.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{a.name}</p>
                  <p className="text-xs text-gray-400">{TYPE_LABELS[a.type]}</p>
                </div>
              </div>
              <p className={`text-2xl font-bold ${a.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                {formatCurrency(a.balance)}
              </p>
              <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => openEdit(a)} className="flex-1 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-1">Edit</button>
                <button onClick={() => handleDelete(a.id)} className="flex-1 text-xs text-gray-400 hover:text-red-500 py-1">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-16">No accounts yet. Add your wallets and bank accounts.</p>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit account' : 'New account'}>
        <AccountForm initial={editing} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
    </Layout>
  )
}