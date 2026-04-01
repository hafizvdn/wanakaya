import { useEffect, useState } from 'react'
import { accountsApi } from '../lib/api.js'

export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await accountsApi.getAll()
      setAccounts(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createAccount(body) {
    const created = await accountsApi.create(body)
    setAccounts(prev => [...prev, created])
    return created
  }

  async function updateAccount(id, body) {
    const updated = await accountsApi.update(id, body)
    setAccounts(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }

  async function removeAccount(id) {
    await accountsApi.remove(id)
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  return { accounts, loading, error, createAccount, updateAccount, removeAccount, reload: load }
}
