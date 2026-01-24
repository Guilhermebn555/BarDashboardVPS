'use client'

import { useState } from 'react'
import { Plus, ShoppingBag, Trash2, Tag, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'

const normalizeText = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-]/g, ' ')
    .replace(/[^\w\s]/g, '')
}

export function NewPurchaseDialog({ clienteId, produtos, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [itensCompra, setItensCompra] = useState([])
  const [produtoOpen, setProdutoOpen] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [quantidade, setQuantidade] = useState('1')
  const [modoPersonalizado, setModoPersonalizado] = useState(false)
  const [produtoPersonalizado, setProdutoPersonalizado] = useState({ nome: '', preco: '' })
  const [observacoesCompra, setObservacoesCompra] = useState('')
  const [descontoValor, setDescontoValor] = useState('')
  const [showInputDesconto, setShowInputDesconto] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

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
      setModoPersonalizado(false)
    } else {
      if (!produtoSelecionado || !quantidade || parseInt(quantidade) <= 0) return
      
      let precoFinal = parseFloat(produtoSelecionado.preco)
      let nomeFinal = produtoSelecionado.nome

      if (produtoSelecionado.valor_taxa && parseFloat(produtoSelecionado.valor_taxa) > 0) {
        const taxa = parseFloat(produtoSelecionado.valor_taxa)
        precoFinal += taxa
      }
      
      const novoItem = {
        id: Date.now().toString(),
        nome: nomeFinal,
        preco: precoFinal,
        quantidade: parseInt(quantidade),
        taxa_aplicada: produtoSelecionado.valor_taxa || 0
      }
      
      setItensCompra([...itensCompra, novoItem])
      setProdutoSelecionado(null)
    }
    setQuantidade('1')
  }

  const handleRemoverItem = (itemId) => {
    setItensCompra(itensCompra.filter(i => i.id !== itemId))
  }

  const calcularTotalBruto = () => {
    return itensCompra.reduce((total, item) => total + (item.preco * item.quantidade), 0)
  }

  const handleFinalizarCompra = async () => {
    if (itensCompra.length === 0) return
    setLoading(true)
    try {
      const totalBruto = calcularTotalBruto()
      const desconto = descontoValor ? parseFloat(descontoValor) : 0
      const totalFinal = Math.max(0, totalBruto - desconto)
      const descricao = itensCompra.map(i => `${i.quantidade}x ${i.nome}`).join(', ')
      
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          tipo: 'compra',
          valor: totalFinal,
          dados: { 
            descricao, 
            itens: itensCompra,
            subtotal: totalBruto,
            desconto_aplicado: desconto
          },
          observacoes: observacoesCompra || null
        })
      })

      if (res.ok) {
        onSuccess()
        setOpen(false)
        setItensCompra([])
        setProdutoSelecionado(null)
        setObservacoesCompra('')
        setDescontoValor('')
        setShowInputDesconto(false)
      }
    } catch (error) {
      console.error('Error adding purchase:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if(!val) { setShowInputDesconto(false); setDescontoValor(''); }
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1 sm:h-11">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Nova Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Compra (Fiado)</DialogTitle>
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
              <Popover open={produtoOpen} onOpenChange={setProdutoOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {produtoSelecionado ? produtoSelecionado.nome : 'Selecione um produto...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command 
                    filter={(value, search) => {
                      const normalizedValue = normalizeText(value)
                      const normalizedSearch = normalizeText(search)
                      return normalizedValue.includes(normalizedSearch) ? 1 : 0
                    }}
                  >
                    <CommandInput placeholder="Buscar produto..." />
                    <CommandList className="max-h-64 overflow-y-auto overflow-x-hidden">
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {produtos.map((produto) => (
                          <CommandItem
                            key={produto.id}
                            value={produto.nome}
                            onSelect={() => {
                              setProdutoSelecionado(produto)
                              setProdutoOpen(false)
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${produtoSelecionado?.id === produto.id ? 'opacity-100' : 'opacity-0'}`} />
                            <div className="flex-1">
                              <span>{produto.nome}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{formatCurrency(produto.preco)}</span>
                                {produto.valor_taxa > 0 && (
                                  <Badge variant="secondary" className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-200">
                                    + {formatCurrency(produto.valor_taxa)} taxa
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {produtoSelecionado && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
                  Preço Base: {formatCurrency(produtoSelecionado.preco)}
                  {produtoSelecionado.valor_taxa > 0 && (
                     <> + Taxa: {formatCurrency(produtoSelecionado.valor_taxa)}</>
                  )}
                  <br/>
                  {produtoSelecionado.valor_taxa > 0 && (
                     <strong>Preço Final: {formatCurrency(produtoSelecionado.preco + (parseFloat(produtoSelecionado.valor_taxa) || 0))}</strong>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <Label>Nome do Produto</Label>
                <Input value={produtoPersonalizado.nome} onChange={(e) => setProdutoPersonalizado({...produtoPersonalizado, nome: e.target.value})} placeholder="Ex: Cerveja especial" />
              </div>
              <div>
                <Label>Preço</Label>
                <Input type="number" step="0.01" value={produtoPersonalizado.preco} onChange={(e) => setProdutoPersonalizado({...produtoPersonalizado, preco: e.target.value})} placeholder="0.00" />
              </div>
            </>
          )}

          <div>
            <Label>Quantidade</Label>
            <Input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
          </div>

          <Button onClick={handleAdicionarItem} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Adicionar Item
          </Button>

          {itensCompra.length > 0 && (
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-semibold mb-2">Carrinho:</h4>
              {itensCompra.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium"><span className="text-blue-600 font-bold">{item.quantidade}x</span> {item.nome}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.preco)} cada</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatCurrency(item.preco * item.quantidade)}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoverItem(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-2 space-y-2">
                {(showInputDesconto || descontoValor) && (
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calcularTotalBruto())}</span>
                  </div>
                )}

                {!showInputDesconto && !descontoValor ? (
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600" onClick={() => setShowInputDesconto(true)}>
                    <Tag className="w-3 h-3 mr-1" /> Adicionar Desconto
                  </Button>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-red-500">Desconto (R$):</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" step="0.01" className="w-32 text-right h-8" value={descontoValor} onChange={(e) => setDescontoValor(e.target.value)} autoFocus />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDescontoValor(''); setShowInputDesconto(false) }}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg">Total Final:</span>
                  <span className="text-2xl font-bold text-red-600">
                    {formatCurrency(Math.max(0, calcularTotalBruto() - (parseFloat(descontoValor) || 0)))}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label>Observações (Opcional)</Label>
            <Textarea value={observacoesCompra} onChange={(e) => setObservacoesCompra(e.target.value)} rows={3} />
          </div>

          <Button onClick={handleFinalizarCompra} className="w-full" disabled={itensCompra.length === 0 || loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Finalizar Compra'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}