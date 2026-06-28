// src/hooks/useFetch.js
// Reusable hook that handles the loading/error/data lifecycle
// for any API call. Eliminates boilerplate in every component.
//
// Usage:
//   const { data, loading, error, refetch } = useFetch(getDashboard)
//   const { data: products } = useFetch(() => getProducts({ categoryId: 1 }), [categoryId])

import { useState, useEffect, useCallback } from 'react'

export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}