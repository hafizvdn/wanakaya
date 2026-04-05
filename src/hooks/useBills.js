import { useEffect, useState } from 'react'
import { billsApi } from '../lib/api.js'

export function useBills() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await billsApi.getAll()
      setBills(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createBill(body) {
    const created = await billsApi.create(body)
    setBills(prev => [...prev, created].sort((a, b) => a.dueDay - b.dueDay))
    return created
  }

  async function updateBill(id, body) {
    const updated = await billsApi.update(id, body)
    setBills(prev => prev.map(b => b.id === id ? updated : b).sort((a, b) => a.dueDay - b.dueDay))
    return updated
  }

  async function removeBill(id) {
    await billsApi.remove(id)
    setBills(prev => prev.filter(b => b.id !== id))
  }

  return { bills, loading, error, createBill, updateBill, removeBill, reload: load }
}
