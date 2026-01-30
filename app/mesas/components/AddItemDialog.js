'use client'

import { useState, useMemo } from 'react'
import { Plus, Minus, Check, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useConfirmExit } from '@/hooks/useConfirmExit'

const normalizeText = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-]/g, ' ')
    .replace(/[^\w\s]/g, '')
}

export function AddItemDialog({ mesa, produtos, onAddItem }) {
  const [open, setOpen] = useState(false)
  const [produtoOpen, setProdutoOpen] = useState(false)
  const [quiloOpen, setQuiloOpen] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('cadastrado')
  
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [produtoQuiloSelecionado, setProdutoQuiloSelecionado] = useState(null)
  
  const [quantidade, setQuantidade] = useState('1')
  const [pesoInformado, setPesoInformado] = useState('')
  const [produtoPersonalizado, setProdutoPersonalizado] = useState({ nome: '', preco: '' })

  const produtosUnitarios = useMemo(() => produtos.filter(p => !p.isKg), [produtos])
  const produtosPorQuilo = useMemo(() => produtos.filter(p => p.isKg), [produtos])

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const handleConfirm = () => {
    let itemFinal = {}

    if (abaAtiva === 'cadastrado') {
      itemFinal = { 
        modo: 'cadastrado',
        produtoSelecionado: produtoSelecionado, 
        quantidade: quantidade 
      }
    } else if (abaAtiva === 'quilo') {
      itemFinal = { 
        modo: 'quilo',
        produtoSelecionado: produtoQuiloSelecionado, 
        quantidade: pesoInformado,
        precoTotal: parseFloat(produtoQuiloSelecionado.preco) * parseFloat(pesoInformado)
      }
    } else {
      itemFinal = { 
        modo: 'personalizado',
        produtoPersonalizado: produtoPersonalizado,
        quantidade: quantidade 
      }
    }

    onAddItem(mesa, itemFinal)
    resetStates()
  }

  const resetStates = () => {
    setOpen(false)
    setProdutoSelecionado(null)
    setProdutoQuiloSelecionado(null)
    setQuantidade('1')
    setPesoInformado('')
    setProdutoPersonalizado({ nome: '', preco: '' })
  }

  useConfirmExit(open)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Item - {mesa.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant={abaAtiva === 'cadastrado' ? 'default' : 'outline'} size="sm" onClick={() => setAbaAtiva('cadastrado')}>
              Produtos Cadastrados
            </Button>
            <Button variant={abaAtiva === 'quilo' ? 'default' : 'outline'} size="sm" onClick={() => setAbaAtiva('quilo')}>
              Por Quilo
            </Button>
            <Button variant={abaAtiva === 'personalizado' ? 'default' : 'outline'} size="sm" onClick={() => setAbaAtiva('personalizado')}>
              Personalizado
            </Button>
          </div>

          {abaAtiva === 'cadastrado' && (
            <div className="space-y-4">
              <Label>Selecione o Produto (Unidade)</Label>
              <Selector 
                open={produtoOpen} 
                setOpen={setProdutoOpen} 
                items={produtosUnitarios} 
                selectedItem={produtoSelecionado} 
                onSelect={setProdutoSelecionado} 
                formatCurrency={formatCurrency}
                setProdutoOpen={setProdutoOpen}
                produtoOpen={produtoOpen}
                setQuiloOpen={setQuiloOpen}
                quiloOpen={quiloOpen}
              />
              <Counter label="Quantidade" value={quantidade} setValue={setQuantidade} />
            </div>
          )}

          {abaAtiva === 'quilo' && (
            <div className="space-y-4">
              <Label>Selecione o Item (Peso)</Label>
              <Selector 
                open={quiloOpen}
                setOpen={setQuiloOpen}
                items={produtosPorQuilo}
                selectedItem={produtoQuiloSelecionado}
                onSelect={setProdutoQuiloSelecionado}
                formatCurrency={formatCurrency}
                isKg={true}
                setProdutoOpen={setProdutoOpen}
                produtoOpen={produtoOpen}
                setQuiloOpen={setQuiloOpen}
                quiloOpen={quiloOpen}
              />
              <div>
                <Label htmlFor="peso">Peso (Kg)</Label>
                <Input 
                  id="peso" 
                  type="number" 
                  step="0.001" 
                  placeholder="0,000" 
                  value={pesoInformado} 
                  onChange={(e) => setPesoInformado(e.target.value)} 
                />
              </div>
              {produtoQuiloSelecionado && pesoInformado && (
                <p className="text-sm font-bold text-blue-600">
                  Subtotal: {formatCurrency(produtoQuiloSelecionado.preco * parseFloat(pesoInformado))}
                </p>
              )}
            </div>
          )}

          {abaAtiva === 'personalizado' && (
            <div className="space-y-3">
              <Input placeholder="Nome do produto" value={produtoPersonalizado.nome} onChange={(e) => setProdutoPersonalizado({...produtoPersonalizado, nome: e.target.value})} />
              <Input type="number" placeholder="Preço" value={produtoPersonalizado.preco} onChange={(e) => setProdutoPersonalizado({...produtoPersonalizado, preco: e.target.value})} />
              <Counter label="Quantidade" value={quantidade} setValue={setQuantidade} />
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={handleConfirm}
            disabled={
              (abaAtiva === 'cadastrado' && !produtoSelecionado) ||
              (abaAtiva === 'quilo' && (!produtoQuiloSelecionado || !pesoInformado)) ||
              (abaAtiva === 'personalizado' && (!produtoPersonalizado.nome || !produtoPersonalizado.preco))
            }
          >
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}



function Selector({ open, setOpen, items, selectedItem, onSelect, formatCurrency, isKg = false, setProdutoOpen, produtoOpen, setQuiloOpen, quiloOpen }) {
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedItem ? selectedItem.nome : 'Selecione...'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command filter={(value, search) => normalizeText(value).includes(normalizeText(search)) ? 1 : 0}>
            <CommandInput placeholder="Buscar produto..." />
            <CommandList className="max-h-64">
              <CommandEmpty>Nada encontrado.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                      key={item.id}
                      value={item.nome}
                      onSelect={() => {
                        onSelect(item)
                        setProdutoOpen(false)
                        setQuiloOpen(false)
                      }}
                    >
                      <Check className={`mr-2 h-4 w-4 ${selectedItem?.id === item.id ? 'opacity-100' : 'opacity-0'}`} />
                      <div className="flex-1">
                        <p className="font-medium">{item.nome}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.preco)}</p>
                        </div>
                      </div>
                    </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedItem && (
        <div className="mt-2 text-sm">
          <p className="text-muted-foreground">Preço: {formatCurrency(selectedItem.preco)}</p>
        </div>
      )}
    </>
  )
}

function Counter({ label, value, setValue }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={() => setValue(Math.max(1, parseInt(value) - 1).toString())}><Minus className="h-4 w-4"/></Button>
        <Input className="text-center" value={value} onChange={(e) => setValue(e.target.value)} />
        <Button variant="outline" size="icon" onClick={() => setValue((parseInt(value) + 1).toString())}><Plus className="h-4 w-4"/></Button>
      </div>
    </div>
  )
}