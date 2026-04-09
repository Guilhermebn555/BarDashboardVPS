import { useState, useMemo } from 'react'
import { normalizeText } from '@/lib/formatters'

/**
 * Custom hook for managing client filters and search
 * @param {Array} clientes - The list of clients
 * @returns {Object} Filtered clients and filter controls
 */
export function useClientFilters(clientes) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState([])
  const [ordenacao, setOrdenacao] = useState('nome_asc')
  const [filtroDiaPagamento, setFiltroDiaPagamento] = useState('')
  const [filtroLimiteMin, setFiltroLimiteMin] = useState('')
  const [filtroLimiteMax, setFiltroLimiteMax] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos')
  const [filtroTag, setFiltroTag] = useState('')
  const [filtroDados, setFiltroDados] = useState('todos')

  // Filter logic
  const filteredClientes = useMemo(() => {
    let filtered = [...clientes]

    // Search filter
    if (searchQuery.trim()) {
      const normalizedQuery = normalizeText(searchQuery)
      filtered = filtered.filter(cliente =>
        normalizeText(cliente.nome).includes(normalizedQuery) ||
        (cliente.telefone && cliente.telefone.includes(searchQuery)) ||
        (cliente.email && normalizeText(cliente.email).includes(normalizedQuery))
      )
    }

    // Active filters
    if (activeFilters.includes('comSaldo')) {
      filtered = filtered.filter(c => c.saldo !== 0)
    }
    if (activeFilters.includes('emDia')) {
      filtered = filtered.filter(c => c.saldo >= 0)
    }
    if (activeFilters.includes('atrasados')) {
      filtered = filtered.filter(c => c.saldo < 0)
    }
    if (activeFilters.includes('suspensos')) {
      filtered = filtered.filter(c => c.status === 'suspenso')
    }
    if (activeFilters.includes('cancelados')) {
      filtered = filtered.filter(c => c.status === 'cancelado')
    }

    // Additional filters
    if (filtroDiaPagamento) {
      filtered = filtered.filter(c => c.dia_pagamento === parseInt(filtroDiaPagamento))
    }
    if (filtroLimiteMin) {
      filtered = filtered.filter(c => c.limite_credito >= parseFloat(filtroLimiteMin))
    }
    if (filtroLimiteMax) {
      filtered = filtered.filter(c => c.limite_credito <= parseFloat(filtroLimiteMax))
    }
    if (filtroStatus !== 'todos') {
      filtered = filtered.filter(c => c.status === filtroStatus)
    }
    if (filtroFinanceiro !== 'todos') {
      if (filtroFinanceiro === 'devedores') {
        filtered = filtered.filter(c => c.saldo < 0)
      } else if (filtroFinanceiro === 'credores') {
        filtered = filtered.filter(c => c.saldo > 0)
      } else if (filtroFinanceiro === 'zerados') {
        filtered = filtered.filter(c => c.saldo === 0)
      }
    }
    if (filtroTag) {
      const tagQuery = normalizeText(filtroTag)
      filtered = filtered.filter(c => 
        c.tags && c.tags.some(t => normalizeText(t).includes(tagQuery))
      )
    }
    if (filtroDados !== 'todos') {
      if (filtroDados === 'sem_telefone') filtered = filtered.filter(c => !c.telefone)
      if (filtroDados === 'sem_email') filtered = filtered.filter(c => !c.email)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (ordenacao) {
        case 'nome_asc':
          return a.nome.localeCompare(b.nome)
        case 'nome_desc':
          return b.nome.localeCompare(a.nome)
        case 'saldo_menor':
          return a.saldo - b.saldo
        case 'saldo_maior':
          return b.saldo - a.saldo
        case 'limite_maior':
          return (b.limite_credito || 0) - (a.limite_credito || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [clientes, searchQuery, activeFilters, ordenacao, filtroDiaPagamento, filtroLimiteMin, filtroLimiteMax, filtroStatus, filtroFinanceiro, filtroTag, filtroDados])

  const updateActiveFilters = (filter) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const resetFilters = () => {
    setSearchQuery('')
    setActiveFilters([])
    setOrdenacao('nome_asc')
    setFiltroDiaPagamento('')
    setFiltroLimiteMin('')
    setFiltroLimiteMax('')
    setFiltroStatus('todos')
    setFiltroFinanceiro('todos')
    setFiltroTag('')
    setFiltroDados('todos')
  }

  return {
    // State
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    activeFilters,
    ordenacao,
    setOrdenacao,
    filtroDiaPagamento,
    setFiltroDiaPagamento,
    filtroLimiteMin,
    setFiltroLimiteMin,
    filtroLimiteMax,
    setFiltroLimiteMax,
    filtroStatus,
    setFiltroStatus,
    filtroFinanceiro,
    setFiltroFinanceiro,
    filtroTag,
    setFiltroTag,
    filtroDados,
    setFiltroDados,

    // Computed
    filteredClientes,

    // Actions
    updateActiveFilters,
    resetFilters
  }
}