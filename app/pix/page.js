'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, DollarSign, User, Check, Send, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LogoutButton } from '@/components/logout-button'

export default function PixPage() {
  const router = useRouter()
  const [compras, setCompras] = useState([])
  const [comprasFiltradas, setComprasFiltradas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])
  const [showNovaCompra, setShowNovaCompra] = useState(false)
  const [showMarcarPago, setShowMarcarPago] = useState(null)
  const [showEnviarCliente, setShowEnviarCliente] = useState(null)
  const [showDeletar, setShowDeletar] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [nomeCliente, setNomeCliente] = useState('')
  const [itensCompra, setItensCompra] = useState([])
  const [produtoOpen, setProdutoOpen] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [quantidade, setQuantidade] = useState('1')
  const [modoPersonalizado, setModoPersonalizado] = useState(false)
  const [produtoPersonalizado, setProdutoPersonalizado] = useState({ nome: '', preco: '' })
  const [clienteSelecionado, setClienteSelecionado] = useState('')

  useEffect(() => {
    loadCompras()
    loadProdutos()
    loadClientes()
  }, [])

  const loadCompras = async () => {
    try {
      const res = await fetch('/api/compras-pix')
      const data = await res.json()
      const comprasAtivas = (data.compras || []).filter(c => !c.enviado_para_cliente)
      setCompras(comprasAtivas)
      setComprasFiltradas(comprasAtivas)
    } catch (error) {
      console.error('Error loading compras:', error)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setComprasFiltradas(compras)
    } else {
      const filtered = compras.filter(c => 
        c.nome_cliente?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setComprasFiltradas(filtered)
    }
  }, [searchQuery, compras])

  const loadProdutos = async () => {
    try {
      const res = await fetch('/api/produtos')
      const data = await res.json()
      setProdutos(data.produtos?.filter(p => p.ativo) || [])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadClientes = async () => {
    try {
      const res = await fetch('/api/clientes')
      const data = await res.json()
      setClientes(data.clientes || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const handleAdicionarItem = () => {
    if (modoPersonalizado) {
      if (!produtoPersonalizado.nome || !produtoPersonalizado.preco || parseFloat(produtoPersonalizado.preco) <= 0) return

      const novoItem = {
        id: Date.now().toString(),
        nome: produtoPersonalizado.nome,
        preco: parseFloat(produtoPersonalizado.preco),
        quantidade: parseInt(quantidade)
      }
      setItensCompra([...itensCompra, novoItem])
      setProdutoPersonalizado({ nome: '', preco: '' })
      setQuantidade('1')
      setModoPersonalizado(false)
    } else {
      if (!produtoSelecionado || !quantidade || parseInt(quantidade) <= 0) return

      const novoItem = {
        id: Date.now().toString(),
        nome: produtoSelecionado.nome,
        preco: produtoSelecionado.preco,
        quantidade: parseInt(quantidade)
      }
      setItensCompra([...itensCompra, novoItem])
      setProdutoSelecionado(null)
      setQuantidade('1')
    }
  }

  const handleRemoverItem = (itemId) => {
    setItensCompra(itensCompra.filter(i => i.id !== itemId))
  }

  const calcularTotal = () => {
    return itensCompra.reduce((total, item) => total + (item.preco * item.quantidade), 0)
  }

  const handleFinalizarCompra = async () => {
    if (itensCompra.length === 0 || !nomeCliente.trim()) {
      alert('Preencha o nome do cliente e adicione itens')
      return
    }

    try {
      const total = calcularTotal()

      const res = await fetch('/api/compras-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_cliente: nomeCliente,
          itens: itensCompra,
          total
        })
      })

      if (res.ok) {
        await loadCompras()
        setShowNovaCompra(false)
        setNomeCliente('')
        setItensCompra([])
        setProdutoSelecionado(null)
      }
    } catch (error) {
      console.error('Error creating compra:', error)
    }
  }

  const handleMarcarPago = async (compraId) => {
    try {
      const res = await fetch(`/api/compras-pix/${compraId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: true })
      })

      if (res.ok) {
        await loadCompras()
        setShowMarcarPago(null)
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
    }
  }

  const handleEnviarParaCliente = async (compra) => {
    if (!clienteSelecionado) {
      alert('Selecione um cliente')
      return
    }

    try {
      const descricao = compra.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ')

      const transacaoRes = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteSelecionado,
          tipo: 'compra',
          valor: compra.total,
          dados: {
            descricao,
            itens: compra.itens,
            origem: 'pix',
            horario_original: compra.created_at
          }
        })
      })

      if (!transacaoRes.ok) {
        alert('Erro ao enviar para cliente')
        return
      }

      await fetch(`/api/compras-pix/${compra.id}`, {
        method: 'DELETE'
      })

      await loadCompras()
      setShowEnviarCliente(null)
      setClienteSelecionado('')
      alert('Compra enviada para a conta do cliente!')
    } catch (error) {
      console.error('Error sending to client:', error)
      alert('Erro ao enviar para cliente')
    }
  }

  const handleDeletar = async (compraId) => {
    try {
      await fetch(`/api/compras-pix/${compraId}`, {
        method: 'DELETE'
      })

      await loadCompras()
      setShowDeletar(null)
    } catch (error) {
      console.error('Error deleting compra:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateExtended = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ]
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    return `${day} de ${month} de ${year}`
  }

  const groupByDate = (compras) => {
    const groups = {}
    compras.forEach(compra => {
      const dateKey = new Date(compra.created_at).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(compra)
    })
    return groups
  }

  const comprasGrouped = groupByDate(comprasFiltradas)
  const sortedDateKeys = Object.keys(comprasGrouped).sort((a, b) => new Date(b) - new Date(a))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Compras PIX</h1>
            </div>
            <div className="flex gap-2 items-center">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-12"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Lista de Compras ({comprasFiltradas.length})</h2>
          <Dialog open={showNovaCompra} onOpenChange={setShowNovaCompra}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nova Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Compra PIX</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
                  <Input
                    id="nomeCliente"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    placeholder="Digite o nome de quem comprou"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={!modoPersonalizado ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setModoPersonalizado(false)}
                  >
                    Produto Cadastrado
                  </Button>
                  <Button
                    variant={modoPersonalizado ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setModoPersonalizado(true)}
                  >
                    Produto Personalizado
                  </Button>
                </div>

                {!modoPersonalizado ? (
                  <div>
                    <Label>Produto</Label>
                    <Popover open={produtoOpen} onOpenChange={setProdutoOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {produtoSelecionado ? produtoSelecionado.nome : 'Selecione um produto...'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar produto..." />
                          <CommandList className="max-h-64">
                            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                            <CommandGroup>
                              {produtos.map((produto) => (
                                <CommandItem
                                  key={produto.id}
                                  onSelect={() => {
                                    setProdutoSelecionado(produto)
                                    setProdutoOpen(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      produtoSelecionado?.id === produto.id ? 'opacity-100' : 'opacity-0'
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium">{produto.nome}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatCurrency(produto.preco)}
                                    </p>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="nomePers">Nome do Produto *</Label>
                      <Input
                        id="nomePers"
                        value={produtoPersonalizado.nome}
                        onChange={(e) => setProdutoPersonalizado({...produtoPersonalizado, nome: e.target.value})}
                        placeholder="Ex: Cerveja especial"
                      />
                    </div>
                    <div>
                      <Label htmlFor="precoPers">Preço *</Label>
                      <Input
                        id="precoPers"
                        type="number"
                        step="0.01"
                        value={produtoPersonalizado.preco}
                        onChange={(e) => setProdutoPersonalizado({...produtoPersonalizado, preco: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleAdicionarItem}
                  variant="outline"
                  className="w-full"
                  disabled={
                    modoPersonalizado
                      ? !produtoPersonalizado.nome || !produtoPersonalizado.preco || parseFloat(produtoPersonalizado.preco) <= 0
                      : !produtoSelecionado
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>

                {itensCompra.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold mb-2">Itens da Compra:</h4>
                    {itensCompra.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{item.quantidade}x </span>
                            {item.nome}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.preco)} cada
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{formatCurrency(item.preco * item.quantidade)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoverItem(item.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Total:</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(calcularTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleFinalizarCompra}
                  className="w-full"
                  disabled={itensCompra.length === 0 || !nomeCliente.trim()}
                >
                  Finalizar Compra
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {comprasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Nenhuma compra encontrada' : 'Nenhuma compra registrada'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {sortedDateKeys.map((dateKey) => {
              const comprasNoDia = comprasGrouped[dateKey]
              const dataFormatada = formatDateExtended(comprasNoDia[0].created_at)

              return (
                <div key={dateKey} className="space-y-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 border-b-2 pb-2">
                    {dataFormatada}
                  </h1>
                  
                  <div className="space-y-3">
                    {comprasNoDia.map((compra) => (
                      <Card 
                        key={compra.id} 
                        className={`${compra.pago ? 'opacity-60' : ''} transition-opacity`}
                      >
                        <CardContent className="py-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <div className={`flex-1 min-w-0 ${compra.pago ? 'line-through' : ''}`}>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                                <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {formatTime(compra.created_at)}
                                </span>
                                <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 truncate">
                                  - {compra.nome_cliente}
                                </span>
                                {compra.pago && (
                                  <span className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs sm:text-sm font-semibold">
                                    PAGO
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1 mb-3">
                                {compra.itens.map((item, idx) => (
                                  <div key={idx} className="text-sm">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                                      {item.quantidade}x{' '}
                                    </span>
                                    {item.nome} - {formatCurrency(item.preco)}
                                  </div>
                                ))}
                              </div>
                              <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                                Total: {formatCurrency(compra.total)}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              {!compra.pago && (
                                <Dialog open={showMarcarPago === compra.id} onOpenChange={(open) => setShowMarcarPago(open ? compra.id : null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                      <Check className="w-4 h-4 mr-1" />
                                      Pago
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Confirmar Pagamento</DialogTitle>
                                      <DialogDescription>
                                        Deseja marcar esta compra como paga? A compra será riscada na lista.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setShowMarcarPago(null)}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={() => handleMarcarPago(compra.id)}>
                                        Confirmar
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}

                              <Dialog open={showEnviarCliente === compra.id} onOpenChange={(open) => {
                                  setShowEnviarCliente(open ? compra.id : null)
                                  if (!open) setClienteSelecionado('')
                                }}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                      <Send className="w-4 h-4 mr-1" />
                                      Enviar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Enviar para Conta Fiado</DialogTitle>
                                      <DialogDescription>
                                        Selecione o cliente para enviar esta compra. O horário original ({formatTime(compra.created_at)}) será mantido.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Cliente *</Label>
                                        <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione o cliente" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {clientes.map((cliente) => (
                                              <SelectItem key={cliente.id} value={cliente.id}>
                                                <div className="flex items-center gap-2">
                                                  <User className="w-4 h-4" />
                                                  {cliente.nome}
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => {
                                        setShowEnviarCliente(null)
                                        setClienteSelecionado('')
                                      }}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={() => handleEnviarParaCliente(compra)} disabled={!clienteSelecionado}>
                                        Enviar
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                              <Dialog open={showDeletar === compra.id} onOpenChange={(open) => setShowDeletar(open ? compra.id : null)}>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmar Exclusão</DialogTitle>
                                    <DialogDescription>
                                      Tem certeza que deseja deletar esta compra? Esta ação não pode ser desfeita.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowDeletar(null)}>
                                      Cancelar
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeletar(compra.id)}>
                                      Deletar
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
