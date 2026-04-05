import { useEffect, useState } from 'react'
import { transactionsApi } from '../lib/api.js'

export function useTransactions(params = {}) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await transactionsApi.getAll(params)
      setTransactions(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [params.month, params.year, params.categoryId, params.type])

  async function createTransaction(body) {
    const created = await transactionsApi.create(body)
    setTransactions(prev => [created, ...prev])
    return created
  }

  async function updateTransaction(id, body) {
    const updated = await transactionsApi.update(id, body)
    setTransactions(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }

  async function removeTransaction(id) {
    await transactionsApi.remove(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return { transactions, loading, error, createTransaction, updateTransaction, removeTransaction, reload: load }
}
