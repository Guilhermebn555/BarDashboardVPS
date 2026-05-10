'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Minus, Check, Scale, Package, PenTool, Search, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useConfirmExit } from '@/hooks/useConfirmExit'
import { formatCurrency, normalizeText } from '@/lib/formatters'

export function AddItemDialog({ mesa, produtos, onAddItem }) {
  const [open, setOpen] = useState(false)
  
  const [abaAtiva, setAbaAtiva] = useState('cadastrado')
  
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [produtoQuiloSelecionado, setProdutoQuiloSelecionado] = useState(null)
  
  const [quantidade, setQuantidade] = useState('1')
  const [pesoInformado, setPesoInformado] = useState('')
  const [produtoPersonalizado, setProdutoPersonalizado] = useState({ nome: '', preco: '' })

  const produtosUnitarios = useMemo(() => produtos.filter(p => !p.isKg), [produtos])
  const produtosPorQuilo = useMemo(() => produtos.filter(p => p.isKg), [produtos])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
     if(!open) resetStates()
  }, [open])

  const handleConfirm = () => {
    setLoading(true)
    let itemFinal = {}

    if (abaAtiva === 'cadastrado') {
      itemFinal = { 
        modo: 'cadastrado',
        produtoSelecionado: produtoSelecionado, 
        quantidade: quantidade,
        // taxa,
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
    setLoading(false)
    setOpen(false)
  }

  const resetStates = () => {
    setProdutoSelecionado(null)
    setProdutoQuiloSelecionado(null)
    setQuantidade('1')
    setPesoInformado('')
    setProdutoPersonalizado({ nome: '', preco: '' })
    setAbaAtiva('cadastrado')
  }

  const currentTotal = useMemo(() => {
    if (abaAtiva === 'cadastrado' && produtoSelecionado) {
        return produtoSelecionado.preco * parseInt(quantidade || 0)
    }
    if (abaAtiva === 'quilo' && produtoQuiloSelecionado && pesoInformado) {
        return produtoQuiloSelecionado.preco * parseFloat(pesoInformado || 0)
    }
    if (abaAtiva === 'personalizado' && produtoPersonalizado.preco) {
        return parseFloat(produtoPersonalizado.preco) * parseInt(quantidade || 0)
    }
    return 0
  }, [abaAtiva, produtoSelecionado, quantidade, produtoQuiloSelecionado, pesoInformado, produtoPersonalizado])

  useConfirmExit(open)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => setOpen(true)}
          className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
        >
          <Plus className="mr-2 w-6 h-6" /> Adicionar Item
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            Adicionar à {mesa.nome}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 pt-2 space-y-6">
          
          <div className="grid grid-cols-3 p-1 bg-slate-200 dark:bg-slate-900 rounded-xl">
            <TabButton 
                active={abaAtiva === 'cadastrado'} 
                onClick={() => setAbaAtiva('cadastrado')} 
                icon={Package} 
                label="Unidade" 
            />
            <TabButton 
                active={abaAtiva === 'quilo'} 
                onClick={() => setAbaAtiva('quilo')} 
                icon={Scale} 
                label="Por Peso" 
            />
            <TabButton 
                active={abaAtiva === 'personalizado'} 
                onClick={() => setAbaAtiva('personalizado')} 
                icon={PenTool} 
                label="Personalizado" 
            />
          </div>

          <div className="min-h-[220px] space-y-5">
            {abaAtiva === 'cadastrado' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Buscar Produto</Label>
                    <Selector 
                        items={produtosUnitarios} 
                        selectedItem={produtoSelecionado} 
                        onSelect={setProdutoSelecionado} 
                        formatCurrency={formatCurrency}
                    />
                </div>
                
                {produtoSelecionado && (
                    <div className="space-y-2">
                         <Label className="text-xs font-bold text-muted-foreground uppercase">Quantidade</Label>
                         <Counter value={quantidade} setValue={setQuantidade} />
                    </div>
                )}
              </div>
            )}

            {abaAtiva === 'quilo' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">Produto (Kg)</Label>
                    <Selector 
                        items={produtosPorQuilo} 
                        selectedItem={produtoQuiloSelecionado} 
                        onSelect={setProdutoQuiloSelecionado} 
                        formatCurrency={formatCurrency}
                        isKg
                    />
                </div>
                 {produtoQuiloSelecionado && (
                     <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">Peso Total (kg)</Label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                step="0.001" 
                                placeholder="0.000" 
                                value={pesoInformado} 
                                onChange={(e) => setPesoInformado(e.target.value)} 
                                className="h-14 text-2xl font-bold pl-4 pr-12 bg-white dark:bg-slate-900 border-slate-200"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">kg</span>
                        </div>
                     </div>
                 )}
              </div>
            )}

            {abaAtiva === 'personalizado' && (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                 <div className="space-y-2">
                    <Label>Nome do Item</Label>
                    <Input 
                        placeholder="Ex: Linguiça Calabresa" 
                        value={produtoPersonalizado.nome} 
                        onChange={(e) => setProdutoPersonalizado({...produtoPersonalizado, nome: e.target.value})}
                        className="h-12 bg-white dark:bg-slate-900" 
                    />
                 </div>
                 <div className="flex gap-4">
                     <div className="flex-1 space-y-2">
                        <Label>Valor Unitário</Label>
                        <Input 
                            type="number" 
                            placeholder="0.00" 
                            value={produtoPersonalizado.preco} 
                            onChange={(e) => setProdutoPersonalizado({...produtoPersonalizado, preco: e.target.value})}
                            className="h-12 bg-white dark:bg-slate-900" 
                        />
                     </div>
                     <div className="flex-1 space-y-2">
                        <Label>Quantidade</Label>
                        <Counter value={quantidade} setValue={setQuantidade} compact />
                     </div>
                 </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-800">
             <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total do Item</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrency(currentTotal)}
                </p>
             </div>
             <Button 
                size="lg"
                onClick={handleConfirm}
                className="h-12 px-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95"
                disabled={currentTotal <= 0 || loading}
             >
                {loading ? (
                    <Loader2 className="ml-2 w-5 h-5 animate-spin" />
                ) : (
                    <Check className="ml-2 w-5 h-5" />
                )}
                Confirmar
             </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}


function TabButton({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                active 
                ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50 dark:hover:bg-slate-800/50'
            }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    )
}

function Selector({ items, selectedItem, onSelect, formatCurrency, isKg = false }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open}
            className="w-full justify-between h-14 bg-white dark:bg-slate-900 border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-all text-base px-4"
        >
          {selectedItem ? (
             <div className="flex items-center gap-2 text-left w-full">
                 <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 p-1.5 rounded">
                    {isKg ? <Scale className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                 </div>
                 <div className="flex flex-col items-start leading-tight overflow-hidden">
                    <span className="font-semibold truncate w-full">{selectedItem.nome}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                        {formatCurrency(selectedItem.preco)} {isKg ? '/kg' : 'un.'}
                    </span>
                 </div>
             </div>
          ) : (
            <span className="text-muted-foreground flex items-center gap-2">
                <Search className="w-4 h-4" /> Selecione o produto...
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[100%] p-0" align="start">
        <Command filter={(value, search) => normalizeText(value).includes(normalizeText(search)) ? 1 : 0}>
          <CommandInput placeholder="Buscar produto..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>Nada encontrado.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.nome}
                  onSelect={() => {
                    onSelect(item)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between py-3 px-4 cursor-pointer"
                >
                  <div className="flex flex-col">
                     <span className="font-medium">{item.nome}</span>
                     <span className="text-xs text-muted-foreground">{formatCurrency(item.preco)}</span>
                  </div>
                  {selectedItem?.id === item.id && <Check className="h-4 w-4 text-blue-600" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function Counter({ value, setValue, compact = false }) {
    const handleDecrement = () => setValue(Math.max(1, parseInt(value) - 1).toString())
    const handleIncrement = () => setValue((parseInt(value) + 1).toString())

    return (
      <div className={`flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 ${compact ? 'h-12' : 'h-14'}`}>
        <Button 
            variant="ghost" 
            onClick={handleDecrement}
            className="h-full w-14 rounded-none hover:bg-slate-100 text-slate-500 hover:text-red-500 transition-colors"
        >
            <Minus className="w-5 h-5" />
        </Button>
        
        <Input 
            className="border-0 h-full text-center text-xl font-bold focus-visible:ring-0 rounded-none bg-transparent" 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
        />
        
        <Button 
            variant="ghost" 
            onClick={handleIncrement}
            className="h-full w-14 rounded-none hover:bg-slate-100 text-slate-500 hover:text-green-600 transition-colors"
        >
            <Plus className="w-5 h-5" />
        </Button>
      </div>
    )
}