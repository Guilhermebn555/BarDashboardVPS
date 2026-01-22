'use client'

import { useState } from 'react'
import { Plus, Minus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

export function AddItemDialog({ mesa, produtos, onAddItem }) {
  const [open, setOpen] = useState(false)
  const [produtoOpen, setProdutoOpen] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [quantidade, setQuantidade] = useState('1')
  const [modoPersonalizado, setModoPersonalizado] = useState(false)
  const [produtoPersonalizado, setProdutoPersonalizado] = useState({ nome: '', preco: '' })

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const handleConfirm = () => {
    // Passa os dados para o pai (page.js) processar
    onAddItem(mesa, {
      produtoSelecionado,
      quantidade,
      modoPersonalizado,
      produtoPersonalizado
    })
    
    // Reseta o estado local
    setOpen(false)
    setProdutoSelecionado(null)
    setQuantidade('1')
    setModoPersonalizado(false)
    setProdutoPersonalizado({ nome: '', preco: '' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    {produtoSelecionado ? produtoSelecionado.nome : 'Selecione um produto...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command filter={(value, search) => value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0}>
                    <CommandInput placeholder="Buscar produto..." />
                    <CommandList className="max-h-64">
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
                              <p className="font-medium">{produto.nome}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">{formatCurrency(produto.preco)}</p>
                                {produto.valor_taxa > 0 && (
                                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                                        +Taxa {formatCurrency(produto.valor_taxa)}
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
                <div className="mt-2 text-sm">
                    <p className="text-muted-foreground">Preço Base: {formatCurrency(produtoSelecionado.preco)}</p>
                    {produtoSelecionado.valor_taxa > 0 && (
                        <p className="text-amber-600 font-medium">
                            + Taxa Extra: {formatCurrency(produtoSelecionado.valor_taxa)}
                        </p>
                    )}
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="nomePers">Nome do Produto *</Label>
                <Input
                  id="nomePers"
                  value={produtoPersonalizado.nome}
                  onChange={(e) => setProdutoPersonalizado({ ...produtoPersonalizado, nome: e.target.value })}
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
                  onChange={(e) => setProdutoPersonalizado({ ...produtoPersonalizado, preco: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="quantidade">Quantidade *</Label>
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="icon" onClick={() => setQuantidade(Math.max(1, parseInt(quantidade) - 1).toString())}>
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="text-center"
              />
              <Button variant="outline" size="icon" onClick={() => setQuantidade((parseInt(quantidade) + 1).toString())}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
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
  )
}