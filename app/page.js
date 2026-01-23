'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { SearchAndFilters } from '@/components/dashboard/SearchAndFilters'
import { AddClientDialog } from '@/components/dashboard/AddClientDialog'
import { ClientList } from '@/components/dashboard/ClientList'

export default function App() {
  const [clientes, setClientes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showAddClient, setShowAddClient] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filtroDiaPagamento, setFiltroDiaPagamento] = useState('')
  const [filtroLimiteMin, setFiltroLimiteMin] = useState('')
  const [filtroLimiteMax, setFiltroLimiteMax] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroFinanceiro, setFiltroFinanceiro] = useState('todos')
  const [filtroTag, setFiltroTag] = useState('')
  const [filtroDados, setFiltroDados] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('nome_asc')
  const [activeFilters, setActiveFilters] = useState([])
  
  const [novoCliente, setNovoCliente] = useState({
    nome: '', telefone: '', email: '', apelidos: '',
    dia_pagamento: '', limite_credito: '', tags: ''
  })

  useEffect(() => { loadClientes() }, [])

  const loadClientes = async () => {
    try {
      const res = await fetch('/api/clientes')
      const data = await res.json()
      setClientes(data.clientes || [])
    } catch (error) { console.error('Error loading clients:', error) } 
    finally { setLoading(false) }
  }

  const applyFilters = () => {
    let filtered = [...clientes]
    const filters = []

    if (searchQuery.length > 0) {
      filtered = filtered.filter(c => 
        c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.telefone?.includes(searchQuery) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.apelidos || []).some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (filtroDiaPagamento) {
      const dia = parseInt(filtroDiaPagamento)
      filtered = filtered.filter(c => c.dia_pagamento === dia)
      filters.push(`Dia de Pagamento: ${dia}`)
    }

    if (filtroLimiteMin || filtroLimiteMax) {
      filtered = filtered.filter(c => {
        const limite = c.limite_credito || 0
        const min = filtroLimiteMin ? parseFloat(filtroLimiteMin) : 0
        const max = filtroLimiteMax ? parseFloat(filtroLimiteMax) : Infinity
        return limite >= min && limite <= max
      })
      
      if (filtroLimiteMin && filtroLimiteMax) filters.push(`Limite: R$ ${filtroLimiteMin} - R$ ${filtroLimiteMax}`)
      else if (filtroLimiteMin) filters.push(`Limite: >= R$ ${filtroLimiteMin}`)
      else filters.push(`Limite: <= R$ ${filtroLimiteMax}`)
    }

    if (filtroStatus !== 'todos') {
      filtered = filtered.filter(c => (c.status || 'ativo') === filtroStatus)
      filters.push(`Status: ${filtroStatus.charAt(0).toUpperCase() + filtroStatus.slice(1)}`)
    }

    if (filtroFinanceiro !== 'todos') {
      if (filtroFinanceiro === 'devedores') {
        filtered = filtered.filter(c => c.saldo < 0)
        filters.push('Apenas Devedores')
      } else if (filtroFinanceiro === 'credores') {
        filtered = filtered.filter(c => c.saldo > 0)
        filters.push('Apenas Credores')
      } else if (filtroFinanceiro === 'zerados') {
        filtered = filtered.filter(c => c.saldo === 0)
        filters.push('Saldo Zerado')
      }
    }

    if (filtroTag) {
      filtered = filtered.filter(c => c.tags && c.tags.some(t => t.toLowerCase().includes(filtroTag.toLowerCase())))
      filters.push(`Tag: ${filtroTag}`)
    }

    if (filtroDados !== 'todos') {
      if (filtroDados === 'sem_telefone') {
        filtered = filtered.filter(c => !c.telefone)
        filters.push('Sem Telefone')
      } else if (filtroDados === 'sem_email') {
        filtered = filtered.filter(c => !c.email)
        filters.push('Sem Email')
      }
    }

    filtered.sort((a, b) => {
      switch (ordenacao) {
        case 'nome_asc': return a.nome.localeCompare(b.nome)
        case 'nome_desc': return b.nome.localeCompare(a.nome)
        case 'saldo_menor': return a.saldo - b.saldo 
        case 'saldo_maior': return b.saldo - a.saldo
        case 'limite_maior': return (b.limite_credito || 0) - (a.limite_credito || 0)
        default: return 0
      }
    })

    setActiveFilters(filters)
    setSearchResults(filtered)
  }

  const resetFilters = () => {
    setFiltroDiaPagamento('')
    setFiltroLimiteMin('')
    setFiltroLimiteMax('')
    setFiltroStatus('todos')
    setFiltroFinanceiro('todos')
    setFiltroTag('')
    setFiltroDados('todos')
    setOrdenacao('nome_asc')
    setActiveFilters([])
    setSearchQuery('')
    setSearchResults([])
  }

  useEffect(() => {
    applyFilters()
  }, [searchQuery, filtroDiaPagamento, filtroLimiteMin, filtroLimiteMax, filtroStatus, filtroFinanceiro, filtroTag, filtroDados, ordenacao, clientes])

  const handleAddClient = async () => {
    if (!novoCliente.nome.trim()) return

    try {
      const apelidosArray = novoCliente.apelidos ? novoCliente.apelidos.split(',').map(a => a.trim()).filter(a => a) : []
      const tagsArray = novoCliente.tags ? novoCliente.tags.split(',').map(t => t.trim()).filter(t => t) : []

      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novoCliente,
          apelidos: apelidosArray,
          tags: tagsArray,
          dia_pagamento: novoCliente.dia_pagamento ? parseInt(novoCliente.dia_pagamento) : null,
          limite_credito: novoCliente.limite_credito ? parseFloat(novoCliente.limite_credito) : 0,
        })
      })
      const data = await res.json()
      
      if (data.cliente) {
        await loadClientes()
        setShowAddClient(false)
        setNovoCliente({ nome: '', telefone: '', email: '', apelidos: '', dia_pagamento: '', limite_credito: '', tags: '' })
      }
    } catch (error) { console.error('Error adding client:', error) }
  }

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  
  const getBalanceColor = (saldo) => {
    if (saldo > 0) return 'text-green-600 dark:text-green-400'
    if (saldo < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const isListModified = searchQuery || activeFilters.length > 0 || ordenacao !== 'nome_asc'
  const displayedClientes = isListModified ? searchResults : clientes
  const hasActiveFilters = activeFilters.length > 0 || searchQuery

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <SearchAndFilters 
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          showFilters={showFilters} setShowFilters={setShowFilters}
          activeFilters={activeFilters}
          filtroDiaPagamento={filtroDiaPagamento} setFiltroDiaPagamento={setFiltroDiaPagamento}
          filtroLimiteMin={filtroLimiteMin} setFiltroLimiteMin={setFiltroLimiteMin}
          filtroLimiteMax={filtroLimiteMax} setFiltroLimiteMax={setFiltroLimiteMax}
          filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
          filtroFinanceiro={filtroFinanceiro} setFiltroFinanceiro={setFiltroFinanceiro}
          filtroTag={filtroTag} setFiltroTag={setFiltroTag}
          filtroDados={filtroDados} setFiltroDados={setFiltroDados}
          ordenacao={ordenacao} setOrdenacao={setOrdenacao}
          resetFilters={resetFilters}
        />

        <DashboardStats 
          clientes={clientes}
          displayedClientes={displayedClientes}
          hasActiveFilters={hasActiveFilters}
          formatCurrency={formatCurrency}
        />

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Clientes</h2>
          <AddClientDialog 
            open={showAddClient}
            onOpenChange={setShowAddClient}
            novoCliente={novoCliente}
            setNovoCliente={setNovoCliente}
            onAddClient={handleAddClient}
          />
        </div>

        <ClientList 
          loading={loading}
          displayedClientes={displayedClientes}
          hasActiveFilters={hasActiveFilters}
          resetFilters={resetFilters}
          formatCurrency={formatCurrency}
          getBalanceColor={getBalanceColor}
        />
      </main>
    </div>
  )
}