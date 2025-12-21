'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, DollarSign, ShoppingBag, Calendar, Zap, Trash2, Edit, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeToggle } from '@/components/theme-toggle'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { generateClientePDF } from '@/lib/pdf-generator'

export default function ClientePage() {
  const router = useRouter()
  const params = useParams()
  const clienteId = params.id

  const [cliente, setCliente] = useState(null)
  const [transacoes, setTransacoes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCompra, setShowCompra] = useState(false)
  const [showAbate, setShowAbate] = useState(false)
  const [showZerarConta, setShowZerarConta] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPdfModal, setShowPdfModal] = useState(false)

  const [itensCompra, setItensCompra] = useState([])
  const [produtoOpen, setProdutoOpen] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [quantidade, setQuantidade] = useState('1')
  const [modoPersonalizado, setModoPersonalizado] = useState(false)
  const [produtoPersonalizado, setProdutoPersonalizado] = useState({ nome: '', preco: '' })
  const [observacoesCompra, setObservacoesCompra] = useState('')

  const [valorAbate, setValorAbate] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')

  const [editForm, setEditForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    apelidos: '',
    dia_pagamento: '',
    limite_credito: '',
    tags: ''
  })

  const [pdfDataInicio, setPdfDataInicio] = useState('')
  const [pdfDataFim, setPdfDataFim] = useState('')

  useEffect(() => {
    if (clienteId) {
      loadCliente()
      loadProdutos()
    }
  }, [clienteId])

  const loadCliente = async () => {
    try {
      const res = await fetch(`/api/clientes/${clienteId}`)
      const data = await res.json()
      setCliente(data.cliente)
      setTransacoes(data.transacoes || [])
      
      setEditForm({
        nome: data.cliente.nome || '',
        telefone: data.cliente.telefone || '',
        email: data.cliente.email || '',
        apelidos: data.cliente.apelidos?.join(', ') || '',
        dia_pagamento: data.cliente.dia_pagamento?.toString() || '',
        limite_credito: data.cliente.limite_credito?.toString() || '',
        tags: data.cliente.tags?.join(', ') || ''
      })
    } catch (error) {
      console.error('Error loading client:', error)
    } finally {
      setLoading(false)
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

  const handleEditarCliente = async () => {
    if (!editForm.nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    try {
      const apelidosArray = editForm.apelidos
        ? editForm.apelidos.split(',').map(a => a.trim()).filter(a => a)
        : []
      const tagsArray = editForm.tags
        ? editForm.tags.split(',').map(t => t.trim()).filter(t => t)
        : []

      const res = await fetch(`/api/clientes/${clienteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: editForm.nome,
          telefone: editForm.telefone || null,
          email: editForm.email || null,
          apelidos: apelidosArray,
          dia_pagamento: editForm.dia_pagamento ? parseInt(editForm.dia_pagamento) : null,
          limite_credito: editForm.limite_credito ? parseFloat(editForm.limite_credito) : 0,
          tags: tagsArray
        })
      })

      if (res.ok) {
        await loadCliente()
        setShowEditModal(false)
        alert('Cliente atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Erro ao atualizar cliente')
    }
  }

  const handleDeletarCliente = async () => {
    if (!clienteId) return

    try {
      const res = await fetch(`/api/clientes/${clienteId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Falha ao deletar o cliente.')
      }

      alert('Cliente deletado com sucesso!')
      setShowDeleteModal(false)
      router.push('/')

    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      alert('Ocorreu um erro ao tentar deletar o cliente.')
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

  const calcularTotalCompra = () => {
    return itensCompra.reduce((total, item) => total + (item.preco * item.quantidade), 0)
  }

  const handleFinalizarCompra = async () => {
    if (itensCompra.length === 0) return

    try {
      const total = calcularTotalCompra()
      const descricao = itensCompra.map(i => `${i.quantidade}x ${i.nome}`).join(', ')
      
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          tipo: 'compra',
          valor: total,
          dados: { descricao, itens: itensCompra },
          observacoes: observacoesCompra || null
        })
      })

      if (res.ok) {
        await loadCliente()
        setShowCompra(false)
        setItensCompra([])
        setProdutoSelecionado(null)
        setObservacoesCompra('')
      }
    } catch (error) {
      console.error('Error adding purchase:', error)
    }
  }

  const handleAbaterDinheiro = async () => {
    if (!valorAbate || parseFloat(valorAbate) <= 0) return

    try {
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          tipo: 'abate',
          valor: parseFloat(valorAbate),
          dados: { forma_pagamento: formaPagamento }
        })
      })

      if (res.ok) {
        await loadCliente()
        setShowAbate(false)
        setValorAbate('')
        setFormaPagamento('dinheiro')
      }
    } catch (error) {
      console.error('Error adding payment:', error)
    }
  }

  const handleZerarConta = async () => {
    if (!cliente || cliente.saldo >= 0) return

    try {
      const valorParaZerar = Math.abs(cliente.saldo)
      
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          tipo: 'abate',
          valor: valorParaZerar,
          dados: { forma_pagamento: formaPagamento, tipo_abate: 'zerar_conta' }
        })
      })

      if (res.ok) {
        await loadCliente()
        setShowZerarConta(false)
        setFormaPagamento('dinheiro')
      }
    } catch (error) {
      console.error('Error zeroing account:', error)
    }
  }

  const handleExportarPDF = () => {
    if (!pdfDataInicio) {
      alert('Por favor, selecione a data inicial')
      return
    }

    if (!pdfDataFim) {
      alert('Por favor, selecione a data final')
      return
    }

    const dataInicio = new Date(pdfDataInicio)
    const dataFim = new Date(pdfDataFim)

    if (dataFim < dataInicio) {
      alert('A data final não pode ser anterior à data inicial')
      return
    }

    const transacoesFiltradas = transacoes.filter(t => {
      const dataTransacao = new Date(t.created_at)
      return dataTransacao >= dataInicio && dataTransacao <= dataFim
    })

    if (transacoesFiltradas.length === 0) {
      alert('Nenhuma transação encontrada no período selecionado')
      return
    }

    const doc = generateClientePDF(cliente, transacoesFiltradas, dataInicio, dataFim)
    doc.save(`extrato_${cliente.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    
    setShowPdfModal(false)
    setPdfDataInicio('')
    setPdfDataFim('')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getBalanceColor = (saldo) => {
    if (saldo > 0) return 'text-green-600 dark:text-green-400'
    if (saldo < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cliente não encontrado</p>
      </div>
    )
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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Cliente</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6">
            <div className="flex-1 min-w-0 w-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words">{cliente.nome}</h2>
              {cliente.tags && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">({cliente.tags.join(', ')})</p>
              )}
              {cliente.telefone && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{cliente.telefone}</p>
              )}
              {cliente.email && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 break-all">{cliente.email}</p>
              )}
              {cliente.limite_credito > 0 && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Limite de Crédito: {formatCurrency(cliente.limite_credito)}</p>
              )}
              {cliente.dia_pagamento && (
                <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Dia de pagamento: {cliente.dia_pagamento}</span>
                </div>
              )}
            </div>
            <div className="w-full lg:w-auto lg:text-right">
              <div className="flex gap-2 mb-4 justify-end">
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-blue-600 border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:border-blue-700"
                      aria-label="Editar Cliente"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Editar Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="editNome">Nome Completo *</Label>
                        <Input
                          id="editNome"
                          value={editForm.nome}
                          onChange={(e) => setEditForm({...editForm, nome: e.target.value})}
                          placeholder="Nome completo do cliente"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editTelefone">Telefone</Label>
                          <Input
                            id="editTelefone"
                            value={editForm.telefone}
                            onChange={(e) => setEditForm({...editForm, telefone: e.target.value})}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editEmail">E-mail</Label>
                          <Input
                            id="editEmail"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="editApelidos">Apelidos</Label>
                        <Input
                          id="editApelidos"
                          value={editForm.apelidos}
                          onChange={(e) => setEditForm({...editForm, apelidos: e.target.value})}
                          placeholder="Zé, Zezinho, José (separados por vírgula)"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editDiaPagamento">Dia de Pagamento</Label>
                          <Input
                            id="editDiaPagamento"
                            type="number"
                            min="1"
                            max="31"
                            value={editForm.dia_pagamento}
                            onChange={(e) => setEditForm({...editForm, dia_pagamento: e.target.value})}
                            placeholder="Dia do mês (1-31)"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editLimiteCredito">Limite de Crédito (R$)</Label>
                          <Input
                            id="editLimiteCredito"
                            type="number"
                            step="0.01"
                            value={editForm.limite_credito}
                            onChange={(e) => setEditForm({...editForm, limite_credito: e.target.value})}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="editTags">Tags/Observações</Label>
                        <Textarea
                          id="editTags"
                          value={editForm.tags}
                          onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                          placeholder="VIP, Bom pagador, etc (separados por vírgula)"
                          rows={2}
                        />
                      </div>

                      <Button onClick={handleEditarCliente} className="w-full" disabled={!editForm.nome.trim()}>
                        Salvar Alterações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600 border-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:border-red-700"
                      aria-label="Deletar Cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-xl">Você tem certeza absoluta?</DialogTitle>
                      <DialogDescription>
                        Esta ação <span className="font-bold text-red-600">não pode ser desfeita</span>. 
                        Isso irá deletar permanentemente o cliente <strong className="text-foreground">{cliente?.nome}</strong> e todo o seu histórico de transações.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-end">
                      <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                        Cancelar
                      </Button>
                      <Button variant="destructive" onClick={handleDeletarCliente}>
                        Sim, deletar permanentemente
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showPdfModal} onOpenChange={(open) => {
                  setShowPdfModal(open)
                  if (open && !pdfDataFim) {
                    setPdfDataFim(new Date().toISOString().split('T')[0])
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-green-600 border-green-500 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:border-green-700"
                      aria-label="Exportar PDF"
                    >
                      <FileDown className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Exportar Extrato em PDF</DialogTitle>
                      <DialogDescription>
                        Selecione o período para gerar o extrato de transações.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="pdfDataInicio">Data Inicial *</Label>
                        <Input
                          id="pdfDataInicio"
                          type="date"
                          value={pdfDataInicio}
                          onChange={(e) => setPdfDataInicio(e.target.value)}
                          max={pdfDataFim || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pdfDataFim">Data Final *</Label>
                        <Input
                          id="pdfDataFim"
                          type="date"
                          value={pdfDataFim}
                          onChange={(e) => setPdfDataFim(e.target.value)}
                          min={pdfDataInicio}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Por padrão, a data de hoje é selecionada
                        </p>
                      </div>
                      <Button
                        onClick={handleExportarPDF}
                        className="w-full"
                        disabled={!pdfDataInicio || !pdfDataFim}
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Gerar e Baixar PDF
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Saldo Atual</p>
              <p className={`text-2xl sm:text-4xl font-bold ${getBalanceColor(cliente.saldo)}`}>
                {formatCurrency(cliente.saldo)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
            <Dialog open={showCompra} onOpenChange={setShowCompra}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-1 sm:h-11">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Nova Compra
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Compra</DialogTitle>
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
                            <CommandList 
                              className="max-h-64"
                              onWheel={(e) => e.stopPropagation()} 
                            >
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
                          <span className="text-xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(calcularTotalCompra())}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

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

                  <Button
                    onClick={handleFinalizarCompra}
                    className="w-full"
                    disabled={itensCompra.length === 0}
                  >
                    Finalizar Compra
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAbate} onOpenChange={setShowAbate}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1 sm:h-11">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Abater Dinheiro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Pagamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="valorAbate">Valor Pago *</Label>
                    <Input
                      id="valorAbate"
                      type="number"
                      step="0.01"
                      value={valorAbate}
                      onChange={(e) => setValorAbate(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Forma de Pagamento *</Label>
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
                  <Button
                    onClick={handleAbaterDinheiro}
                    className="w-full"
                    disabled={!valorAbate || parseFloat(valorAbate) <= 0}
                  >
                    Registrar Pagamento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {cliente.saldo < 0 && (
              <Dialog open={showZerarConta} onOpenChange={setShowZerarConta}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary" className="flex-1 sm:flex-none sm:h-11">
                    <Zap className="w-4 h-4 mr-2" />
                    Zerar Conta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Zerar Conta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
                      <p className="text-sm text-muted-foreground mb-1">Valor para zerar:</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(Math.abs(cliente.saldo))}
                      </p>
                    </div>
                    <div>
                      <Label>Forma de Pagamento *</Label>
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
                    <Button
                      onClick={handleZerarConta}
                      className="w-full"
                    >
                      Confirmar e Zerar Conta
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Histórico de Transações</h3>
        
        {transacoes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">Nenhuma transação registrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transacoes.map((transacao) => (
              <Card key={transacao.id}>
                <CardContent className="py-3 sm:py-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        {transacao.tipo === 'compra' ? (
                          <Badge variant="destructive" className="text-xs">Compra</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600 text-xs">Pagamento</Badge>
                        )}
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transacao.created_at)}
                        </span>
                      </div>
                      {transacao.dados?.itens && transacao.dados.itens.length > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {transacao.dados.itens.map((item, idx) => (
                            <div key={idx}>
                              <span className="text-blue-600 dark:text-blue-400 font-bold">{item.quantidade}x </span>
                              {item.nome}
                            </div>
                          ))}
                        </div>
                      )}
                      {transacao.observacoes && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 italic">
                          Obs: {transacao.observacoes}
                        </p>
                      )}
                      {transacao.dados?.forma_pagamento && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Forma: {transacao.dados.forma_pagamento}
                        </p>
                      )}
                    </div>
                    <div className="w-full sm:w-auto sm:text-right">
                      <p className={`text-lg sm:text-xl font-bold ${
                        transacao.tipo === 'compra' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {transacao.tipo === 'compra' ? '-' : '+'}
                        {formatCurrency(transacao.valor)}
                      </p>
                    </div>
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
