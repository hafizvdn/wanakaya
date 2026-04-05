import { useEffect, useState } from 'react'
import { budgetsApi } from '../lib/api.js'

export function useBudgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await budgetsApi.getAll()
      setBudgets(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createBudget(body) {
    const created = await budgetsApi.create(body)
    setBudgets(prev => [...prev, created])
    return created
  }

  async function updateBudget(id, body) {
    const updated = await budgetsApi.update(id, body)
    setBudgets(prev => prev.map(b => b.id === id ? updated : b))
    return updated
  }

  async function removeBudget(id) {
    await budgetsApi.remove(id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  return { budgets, loading, error, createBudget, updateBudget, removeBudget, reload: load }
}
