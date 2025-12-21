'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, ShoppingBag, DollarSign, User, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'

export default function MesasPage() {
  const router = useRouter()
  const [mesas, setMesas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])
  const [showNovaMesa, setShowNovaMesa] = useState(false)
  const [showAddItem, setShowAddItem] = useState(null)
  const [showFinalizarMesa, setShowFinalizarMesa] = useState(null)
  const [showAbater, setShowAbater] = useState(null)
  const [nomeMesa, setNomeMesa] = useState('')
  const [observacoesMesa, setObservacoesMesa] = useState('')
  
  const [produtoOpen, setProdutoOpen] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [quantidade, setQuantidade] = useState('1')
  const [modoPersonalizado, setModoPersonalizado] = useState(false)
  const [produtoPersonalizado, setProdutoPersonalizado] = useState({ nome: '', preco: '' })
  
  const [tipoPagamento, setTipoPagamento] = useState('vista')
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [observacoesCompra, setObservacoesCompra] = useState('')

  const [valorAbater, setValorAbater] = useState('')
  const [metodoPagamentoAbater, setMetodoPagamentoAbater] = useState('dinheiro')

  useEffect(() => {
    loadProdutos()
    loadClientes()
    loadMesas()
  }, [])

  const loadMesas = async () => {
    try {
      const res = await fetch('/api/mesas')
      const data = await res.json()
      setMesas(data.mesas || [])
    } catch (error) {
      console.error('Error loading mesas:', error)
    }
  }

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

  const handleNovaMesa = async () => {
    if (!nomeMesa.trim()) return

    try {
      const res = await fetch('/api/mesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeMesa,
          itens: [],
          observacoes: observacoesMesa || null
        })
      })

      if (res.ok) {
        await loadMesas()
        setNomeMesa('')
        setObservacoesMesa('')
        setShowNovaMesa(false)
      }
    } catch (error) {
      console.error('Error creating mesa:', error)
    }
  }

  const handleAdicionarItem = async (mesa) => {
    let novoItem

    if (modoPersonalizado) {
      if (!produtoPersonalizado.nome || !produtoPersonalizado.preco || parseFloat(produtoPersonalizado.preco) <= 0) return
      
      novoItem = {
        id: Date.now().toString(),
        nome: produtoPersonalizado.nome,
        preco: parseFloat(produtoPersonalizado.preco),
        quantidade: parseInt(quantidade),
        ehAbatimento: false
      }
      setProdutoPersonalizado({ nome: '', preco: '' })
    } else {
      if (!produtoSelecionado || !quantidade || parseInt(quantidade) <= 0) return
      
      novoItem = {
        id: Date.now().toString(),
        produto_id: produtoSelecionado.id,
        nome: produtoSelecionado.nome,
        preco: produtoSelecionado.preco,
        quantidade: parseInt(quantidade),
        ehAbatimento: false
      }
    }

    try {
      const itensAtualizados = [...mesa.itens, novoItem]
      const res = await fetch(`/api/mesas/${mesa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: mesa.nome,
          itens: itensAtualizados,
          observacoes: mesa.observacoes
        })
      })

      if (res.ok) {
        await loadMesas()
        setProdutoSelecionado(null)
        setQuantidade('1')
        setShowAddItem(null)
        setModoPersonalizado(false)
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleRemoverItem = async (mesa, itemId) => {
    try {
      const itensAtualizados = mesa.itens.filter(item => item.id !== itemId)
      const res = await fetch(`/api/mesas/${mesa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: mesa.nome,
          itens: itensAtualizados,
          observacoes: mesa.observacoes
        })
      })

      if (res.ok) {
        await loadMesas()
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const calcularTotal = (itens) => {
    return itens.reduce((total, item) => {
      return total + (item.preco * item.quantidade)
    }, 0)
  }

  const handleFinalizarMesa = async (mesa) => {
    const total = calcularTotal(mesa.itens)

    if (total <= 0) {
      alert(`Mesa ${mesa.nome} finalizada com valor total zerado.`)
      try {
        await fetch(`/api/mesas/${mesa.id}`, { method: 'DELETE' })
        await loadMesas()
        setShowFinalizarMesa(null)
      } catch (error) {
        console.error('Error deleting mesa:', error)
      }
      return
    }

    if (tipoPagamento === 'fiado') {
      if (!clienteSelecionado) {
        alert('Selecione um cliente para registrar na caderneta')
        return
      }

      try {
        const descricao = mesa.itens
          .filter(i => !i.ehAbatimento)
          .map(i => `${i.quantidade}x ${i.nome}`)
          .join(', ')
        
        await fetch('/api/transacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cliente_id: clienteSelecionado,
            tipo: 'compra',
            valor: total,
            dados: { 
              descricao,
              mesa: mesa.nome,
              itens: mesa.itens
            },
            observacoes: observacoesCompra || null
          })
        })

        alert('Consumo registrado na caderneta do cliente!')
      } catch (error) {
        console.error('Error registering purchase:', error)
        alert('Erro ao registrar compra')
        return
      }
    } else {
      alert(`Mesa ${mesa.nome} finalizada! Pagamento: ${formaPagamento} - Total: ${formatCurrency(total)}`)
    }

    try {
      await fetch(`/api/mesas/${mesa.id}`, { method: 'DELETE' })
      await loadMesas()
      setShowFinalizarMesa(null)
      setTipoPagamento('vista')
      setClienteSelecionado('')
      setFormaPagamento('dinheiro')
      setObservacoesCompra('')
    } catch (error) {
      console.error('Error finalizing mesa:', error)
    }
  }

  const handleAbaterDinheiro = async (mesa) => {
    const valor = parseFloat(valorAbater)
    const totalMesa = calcularTotal(mesa.itens)

    if (!valor || valor <= 0) {
      alert('Por favor, insira um valor válido para abater.')
      return
    }

    if (valor > totalMesa) {
      alert('O valor a abater não pode ser maior que o total da mesa.')
      return
    }

    const itemAbatimento = {
      id: Date.now().toString(),
      nome: `Abatimento (${metodoPagamentoAbater.charAt(0).toUpperCase() + metodoPagamentoAbater.slice(1)})`,
      preco: -valor, 
      quantidade: 1,
      ehAbatimento: true
    }

    try {
      const itensAtualizados = [...mesa.itens, itemAbatimento]
      const res = await fetch(`/api/mesas/${mesa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: mesa.nome,
          itens: itensAtualizados,
          observacoes: mesa.observacoes
        })
      })

      if (res.ok) {
        await loadMesas()
        setValorAbater('')
        setMetodoPagamentoAbater('dinheiro')
        setShowAbater(null)
      }
    } catch (error) {
      console.error('Error abating value:', error)
    }
  }

  const handleFecharMesa = async (mesaId) => {
    if (!confirm('Deseja fechar esta mesa sem registrar?')) return
    
    try {
      await fetch(`/api/mesas/${mesaId}`, { method: 'DELETE' })
      await loadMesas()
    } catch (error) {
      console.error('Error closing mesa:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Mesas / Consumo do Dia</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Mesas Abertas ({mesas.length})</h2>
          <Dialog open={showNovaMesa} onOpenChange={setShowNovaMesa}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nova Mesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Mesa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nomeMesa">Nome da Mesa *</Label>
                  <Input
                    id="nomeMesa"
                    value={nomeMesa}
                    onChange={(e) => setNomeMesa(e.target.value)}
                    placeholder="Ex: João, Mesa 1, etc."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite o nome do cliente ou número da mesa
                  </p>
                </div>
                <div>
                  <Label htmlFor="observacoesMesa">Observações (Opcional)</Label>
                  <Textarea
                    id="observacoesMesa"
                    value={observacoesMesa}
                    onChange={(e) => setObservacoesMesa(e.target.value)}
                    placeholder="Observações sobre esta mesa..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleNovaMesa} className="w-full" disabled={!nomeMesa.trim()}>
                  Criar Mesa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {mesas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhuma mesa aberta no momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mesas.map((mesa) => (
              <Card key={mesa.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl truncate">{mesa.nome}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(mesa.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {mesa.observacoes && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 italic">
                          Obs: {mesa.observacoes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFecharMesa(mesa.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {mesa.itens.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum item adicionado
                      </p>
                    ) : (
                      mesa.itens.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex-1">
                            <p className={`font-medium ${item.ehAbatimento ? 'text-red-500 dark:text-red-400' : ''}`}>
                              {!item.ehAbatimento && (
                                <span className="text-blue-600 dark:text-blue-400 font-bold">{item.quantidade}x </span>
                              )}
                              {item.nome}
                            </p>
                            {!item.ehAbatimento ? (
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(item.preco)} cada
                              </p>
                            ) : (
                              <p className="text-sm text-red-500 dark:text-red-400 italic">
                                Pagamento parcial
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${item.ehAbatimento ? 'text-red-500 dark:text-red-400' : ''}`}>
                              {formatCurrency(item.preco * item.quantidade)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoverItem(mesa, item.id)}
                              aria-label="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(calcularTotal(mesa.itens))}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Dialog open={showAddItem === mesa.id} onOpenChange={(open) => {
                      setShowAddItem(open ? mesa.id : null)
                      if (!open) {
                        setModoPersonalizado(false)
                        setProdutoSelecionado(null)
                        setProdutoPersonalizado({ nome: '', preco: '' })
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Item - {mesa.nome}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
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
                                    <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                    <CommandGroup className="max-h-64 overflow-auto">
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
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              {produtoSelecionado && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Preço: {formatCurrency(produtoSelecionado.preco)}
                                </p>
                              )}
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
                            onClick={() => handleAdicionarItem(mesa)}
                            className="w-full"
                            disabled={
                              modoPersonalizado
                                ? !produtoPersonalizado.nome || !produtoPersonalizado.preco || parseFloat(produtoPersonalizado.preco) <= 0
                                : !produtoSelecionado || !quantidade || parseInt(quantidade) <= 0
                            }
                          >
                            Adicionar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showFinalizarMesa === mesa.id} onOpenChange={(open) => setShowFinalizarMesa(open ? mesa.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex-1" disabled={mesa.itens.length === 0}>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Finalizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Finalizar Mesa - {mesa.nome}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
                            <p className="text-sm text-muted-foreground mb-1">Total a pagar:</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(calcularTotal(mesa.itens))}
                            </p>
                          </div>

                          <div>
                            <Label>Forma de Pagamento *</Label>
                            <Select value={tipoPagamento} onValueChange={setTipoPagamento}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vista">À Vista (Pago)</SelectItem>
                                <SelectItem value="fiado">Fiado (Caderneta)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {tipoPagamento === 'vista' && (
                            <div>
                              <Label>Método de Pagamento *</Label>
                              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                  <SelectItem value="pix">PIX</SelectItem>
                                  <SelectItem value="cartao">Cartão</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {tipoPagamento === 'fiado' && (
                            <>
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
                              <div>
                                <Label htmlFor="observacoesCompra">Observações (Opcional)</Label>
                                <Textarea
                                  id="observacoesCompra"
                                  value={observacoesCompra}
                                  onChange={(e) => setObservacoesCompra(e.target.value)}
                                  placeholder="Observações sobre esta compra..."
                                  rows={3}
                                />
                              </div>
                            </>
                          )}

                          <Button
                            onClick={() => handleFinalizarMesa(mesa)}
                            className="w-full"
                            disabled={(tipoPagamento === 'fiado' && !clienteSelecionado) || calcularTotal(mesa.itens) <= 0}
                          >
                            Confirmar e Finalizar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={showAbater === mesa.id} onOpenChange={(open) => {
                        setShowAbater(open ? mesa.id : null)
                        if (!open) {
                          setValorAbater('')
                          setMetodoPagamentoAbater('dinheiro')
                        }
                      }}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="sm" className="flex-1" disabled={mesa.itens.length === 0 || calcularTotal(mesa.itens) <= 0}>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Abater
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Abater Valor - {mesa.nome}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
                            <p className="text-sm text-muted-foreground mb-1">Valor Atual:</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(calcularTotal(mesa.itens))}
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="valorAbater">Valor a Abater *</Label>
                            <Input
                              id="valorAbater"
                              type="number"
                              step="0.01"
                              value={valorAbater}
                              onChange={(e) => setValorAbater(e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
 
                          <div>
                            <Label>Método de Pagamento *</Label>
                            <Select value={metodoPagamentoAbater} onValueChange={setMetodoPagamentoAbater}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                <SelectItem value="pix">PIX</SelectItem>
                                <SelectItem value="cartao">Cartão</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            onClick={() => handleAbaterDinheiro(mesa)}
                            className="w-full"
                            disabled={!valorAbater || parseFloat(valorAbater) <= 0}
                          >
                            Confirmar e Abater
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
