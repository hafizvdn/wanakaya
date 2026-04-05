import { useEffect, useState } from 'react'
import { categoriesApi } from '../lib/api.js'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    try {
      setLoading(true)
      const data = await categoriesApi.getAll()
      setCategories(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createCategory(body) {
    const created = await categoriesApi.create(body)
    setCategories(prev => [...prev, created])
    return created
  }

  async function updateCategory(id, body) {
    const updated = await categoriesApi.update(id, body)
    setCategories(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }

  async function removeCategory(id) {
    await categoriesApi.remove(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return { categories, loading, error, createCategory, updateCategory, removeCategory, reload: load }
}
