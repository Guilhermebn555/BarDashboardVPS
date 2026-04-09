'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { SearchAndFilters } from '@/components/dashboard/SearchAndFilters'
import { AddClientDialog } from '@/components/dashboard/AddClientDialog'
import { ClientList } from '@/components/dashboard/ClientList'
import { formatCurrency, normalizeText } from '@/lib/formatters'
import { useClients } from '@/hooks/useClients'
import { useClientFilters } from '@/hooks/useClientFilters'

export default function App() {
  const { clientes, loading, refetch } = useClients()
  const {
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
    filteredClientes,
    updateActiveFilters,
    resetFilters
  } = useClientFilters(clientes)

  const [showAddClient, setShowAddClient] = useState(false)
  const [savingClient, setSavingClient] = useState(false)
  const [searchResults, setSearchResults] = useState([]) // Might be legacy, check if used

  const [novoCliente, setNovoCliente] = useState({
    nome: '', telefone: '', email: '', apelidos: '',
    dia_pagamento: '', limite_credito: '', tags: ''
  })

  const handleAddClient = async () => {
    if (!novoCliente.nome.trim()) return

    setSavingClient(true)

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
        await refetch()
        setShowAddClient(false)
        setNovoCliente({ nome: '', telefone: '', email: '', apelidos: '', dia_pagamento: '', limite_credito: '', tags: '' })
      }
    } catch (error) { 
      console.error('Error adding client:', error)
    } finally {
      setSavingClient(false)
    }
  }

  const getBalanceColor = (saldo) => {
    if (saldo > 0) return 'text-green-600 dark:text-green-400'
    if (saldo < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const isListModified = searchQuery || activeFilters.length > 0 || ordenacao !== 'nome_asc'
  const displayedClientes = filteredClientes
  const hasActiveFilters = activeFilters.length > 0 || searchQuery

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader
        title="Bar do Roldão"
        logout={true}
        arrow={false}
      />

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
            setSavingClient={setSavingClient}
            savingClient={savingClient}
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