'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Package, ShoppingCart, Plus, Coffee, DollarSign, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogoutButton } from '@/components/logout-button'

export default function App() {
  const router = useRouter()
  const [clientes, setClientes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showAddClient, setShowAddClient] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filtroDiaPagamento, setFiltroDiaPagamento] = useState('')
  const [filtroLimiteMin, setFiltroLimiteMin] = useState('')
  const [filtroLimiteMax, setFiltroLimiteMax] = useState('')
  const [activeFilters, setActiveFilters] = useState([])
  
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
    apelidos: '',
    dia_pagamento: '',
    limite_credito: '',
    tags: ''
  })

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      const res = await fetch('/api/clientes')
      const data = await res.json()
      setClientes(data.clientes || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
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
      
      if (filtroLimiteMin && filtroLimiteMax) {
        filters.push(`Limite: R$ ${filtroLimiteMin} - R$ ${filtroLimiteMax}`)
      } else if (filtroLimiteMin) {
        filters.push(`Limite: >= R$ ${filtroLimiteMin}`)
      } else {
        filters.push(`Limite: <= R$ ${filtroLimiteMax}`)
      }
    }

    setActiveFilters(filters)
    setSearchResults(filtered)
  }

  const resetFilters = () => {
    setFiltroDiaPagamento('')
    setFiltroLimiteMin('')
    setFiltroLimiteMax('')
    setActiveFilters([])
    setSearchQuery('')
    setSearchResults([])
  }

  useEffect(() => {
    applyFilters()
  }, [searchQuery, filtroDiaPagamento, filtroLimiteMin, filtroLimiteMax, clientes])

  const handleAddClient = async () => {
    if (!novoCliente.nome.trim()) return

    try {
      const apelidosArray = novoCliente.apelidos
        ? novoCliente.apelidos.split(',').map(a => a.trim()).filter(a => a)
        : []
      const tagsArray = novoCliente.tags
        ? novoCliente.tags.split(',').map(t => t.trim()).filter(t => t)
        : []

      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoCliente.nome,
          telefone: novoCliente.telefone || null,
          email: novoCliente.email || null,
          apelidos: apelidosArray,
          dia_pagamento: novoCliente.dia_pagamento ? parseInt(novoCliente.dia_pagamento) : null,
          limite_credito: novoCliente.limite_credito ? parseFloat(novoCliente.limite_credito) : 0,
          tags: tagsArray
        })
      })
      const data = await res.json()
      
      if (data.cliente) {
        await loadClientes()
        setShowAddClient(false)
        setNovoCliente({ nome: '', telefone: '', email: '', apelidos: '', dia_pagamento: '', limite_credito: '', tags: '' })
      }
    } catch (error) {
      console.error('Error adding client:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getBalanceColor = (saldo) => {
    if (saldo > 0) return 'text-green-600 dark:text-green-400'
    if (saldo < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const displayedClientes = searchQuery || activeFilters.length > 0 ? searchResults : clientes
  const hasActiveFilters = activeFilters.length > 0 || searchQuery

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Bar do Roldão</h1>
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none sm:h-10">
                <Link href="/mesas">
                  <Coffee className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Mesas</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none sm:h-10">
                <Link href="/pix">
                  <DollarSign className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">PIX</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none sm:h-10">
                <Link href="/produtos">
                  <Package className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Produtos</span>
                </Link>
              </Button>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 sm:h-12 text-base sm:text-lg"
              />
            </div>
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 sm:h-12 w-full sm:w-auto">
                  <Filter className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Filtros</span>
                  {activeFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2">{activeFilters.length}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Filtros</h4>
                  </div>

                  <div>
                    <Label htmlFor="filtroDia">Dia de Pagamento</Label>
                    <Input
                      id="filtroDia"
                      type="number"
                      min="1"
                      max="31"
                      value={filtroDiaPagamento}
                      onChange={(e) => setFiltroDiaPagamento(e.target.value)}
                      placeholder="1-31"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Filtrar por dia do mês de pagamento
                    </p>
                  </div>

                  <div>
                    <Label>Limite de Crédito</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          value={filtroLimiteMin}
                          onChange={(e) => setFiltroLimiteMin(e.target.value)}
                          placeholder="Mínimo"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          value={filtroLimiteMax}
                          onChange={(e) => setFiltroLimiteMax(e.target.value)}
                          placeholder="Máximo"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Filtrar por intervalo de limite de crédito
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="flex-1"
                    >
                      Limpar Filtros
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="flex-1"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 max-w-2xl mx-auto">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Busca: "{searchQuery}"
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {activeFilters.map((filter, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => {
                      if (filter.includes('Dia')) setFiltroDiaPagamento('')
                      if (filter.includes('Limite')) {
                        setFiltroLimiteMin('')
                        setFiltroLimiteMax('')
                      }
                    }}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayedClientes.length}</div>
              {hasActiveFilters && clientes.length !== displayedClientes.length && (
                <p className="text-xs text-muted-foreground">de {clientes.length} total</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes com Débito</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayedClientes.filter(c => c.saldo < 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total em Aberto</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(displayedClientes.reduce((sum, c) => sum + (c.saldo < 0 ? Math.abs(c.saldo) : 0), 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Clientes</h2>
          <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={novoCliente.nome}
                    onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                    placeholder="Nome completo do cliente"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoCliente.email}
                      onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="apelidos">Apelidos</Label>
                  <Input
                    id="apelidos"
                    value={novoCliente.apelidos}
                    onChange={(e) => setNovoCliente({...novoCliente, apelidos: e.target.value})}
                    placeholder="Zé, Zezinho, José (separados por vírgula)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separe múltiplos apelidos com vírgula
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dia_pagamento">Dia de Pagamento</Label>
                    <Input
                      id="dia_pagamento"
                      type="number"
                      min="1"
                      max="31"
                      value={novoCliente.dia_pagamento}
                      onChange={(e) => setNovoCliente({...novoCliente, dia_pagamento: e.target.value})}
                      placeholder="Dia do mês (1-31)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="limite_credito">Limite de Crédito (R$)</Label>
                    <Input
                      id="limite_credito"
                      type="number"
                      step="0.01"
                      value={novoCliente.limite_credito}
                      onChange={(e) => setNovoCliente({...novoCliente, limite_credito: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags/Observações</Label>
                  <Textarea
                    id="tags"
                    value={novoCliente.tags}
                    onChange={(e) => setNovoCliente({...novoCliente, tags: e.target.value})}
                    placeholder="VIP, Bom pagador, etc (separados por vírgula)"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separe múltiplas tags com vírgula
                  </p>
                </div>

                <Button onClick={handleAddClient} className="w-full" disabled={!novoCliente.nome.trim()}>
                  Adicionar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Carregando clientes...</p>
          </div>
        ) : displayedClientes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {hasActiveFilters ? 'Nenhum cliente encontrado com os filtros aplicados' : 'Nenhum cliente cadastrado ainda'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters} className="mt-4">
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedClientes.map((cliente) => (
              <Card 
                key={cliente.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/cliente/${cliente.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                  {cliente.telefone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.telefone}</p>
                  )}
                  {cliente.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.email}</p>
                  )}
                  {cliente.dia_pagamento && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Paga dia {cliente.dia_pagamento}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Saldo:</span>
                    <span className={`text-lg font-bold ${getBalanceColor(cliente.saldo)}`}>
                      {formatCurrency(cliente.saldo)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
