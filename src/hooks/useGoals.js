import { useEffect, useState } from 'react'
import { goalsApi } from '../lib/api.js'

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await goalsApi.getAll()
      setGoals(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createGoal(body) {
    const created = await goalsApi.create(body)
    setGoals(prev => [...prev, created])
    return created
  }

  async function updateGoal(id, body) {
    const updated = await goalsApi.update(id, body)
    setGoals(prev => prev.map(g => g.id === id ? updated : g))
    return updated
  }

  async function removeGoal(id) {
    await goalsApi.remove(id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return { goals, loading, error, createGoal, updateGoal, removeGoal, reload: load }
}
