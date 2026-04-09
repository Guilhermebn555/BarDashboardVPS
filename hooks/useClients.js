import { useState, useEffect } from 'react'

/**
 * Custom hook for fetching and managing clients data
 * @returns {Object} Clients data and loading state
 */
export function useClients() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/clientes')
      if (!res.ok) throw new Error('Failed to fetch clients')
      const data = await res.json()
      setClientes(data.clientes || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      // Could show toast here, but keeping simple
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  return {
    clientes,
    loading,
    refetch: fetchClientes
  }
}