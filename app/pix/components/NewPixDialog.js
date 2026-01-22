'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function NewPixDialog({ produtos, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [nomeCliente, setNomeCliente] = useState('')
  const [itensCompra, setItensCompra] = useState([])
  
  // Estados do formulário de item
  const [produtoOpen, setProdutoOpen] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [quantidade, setQuantidade] = useState('1')
  const [modoPersonalizado, setModoPersonalizado] = useState(false)
  const [produtoPersonalizado, setProdutoPersonalizado] = useState({ nome: '', preco: '' })

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

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
        onSuccess() // Recarrega a lista no pai
        setOpen(false)
        setNomeCliente('')
        setItensCompra([])
        setProdutoSelecionado(null)
      }
    } catch (error) {
      console.error('Error creating compra:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
  )
}