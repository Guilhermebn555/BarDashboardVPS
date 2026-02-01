'use client'

import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Printer,
  Minus,
  Clock, 
  Utensils 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AddItemDialog } from './AddItemDialog'
import { AbateDialog } from './AbateDialog'
import handlePrintPDF from '@/lib/pdf-mesas'
import { FinalizeDialog } from './FinalizeDialog'
import { LogsDialog } from './LogsDialog'
import { DeleteMesaDialog } from './DeleteDialog'

export function MesaWorkspace({ 
  mesa, 
  onBack, 
  onAddItem, 
  onFinalize, 
  onAbate, 
  onRemoveItem,
  produtos,
  clientes,
  onUpdateQuantidade
}) {
  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const formatTime = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
  
  const total = mesa.itens.reduce((acc, item) => {
    const val = item.isKg ? parseFloat(item.preco) : (item.preco * item.quantidade)
    return acc + val
  }, 0)

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
      
      <div className="bg-white dark:bg-slate-900 border-b p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-6 w-6 text-slate-600" />
          </Button>
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {mesa.nome}
              </h1>
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                Aberta
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
              <Clock className="w-4 h-4" />
              <span>Início: {formatTime(mesa.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-slate-400">ID #{mesa.id}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950/50">
          <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 border-b text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            <span>Itens do Pedido ({mesa.itens.length})</span>
            <span>Subtotal</span>
          </div>

          <ScrollArea className="flex-1 p-4">
            {mesa.itens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                <Utensils className="w-16 h-16" />
                <p className="text-lg font-medium">Nenhum item lançado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mesa.itens.map((item) => (
                  <div 
                    key={item.id}
                    className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${
                      item.ehAbatimento 
                        ? 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900' 
                        : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      
                      {!item.isKg && !item.ehAbatimento ? (
                        <div className="flex items-center h-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none hover:bg-white dark:hover:bg-slate-800 text-slate-500"
                            disabled={item.quantidade <= 1}
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateQuantidade(mesa, item.id, item.quantidade - 1)
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>

                          <span className="w-8 text-center text-sm font-bold text-slate-700 dark:text-slate-200">
                            {item.quantidade}
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none hover:bg-white dark:hover:bg-slate-800 text-blue-600 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateQuantidade(mesa, item.id, item.quantidade + 1)
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${
                          item.ehAbatimento ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.isKg ? 'Kg' : item.quantidade}
                        </div>
                      )}

                      <div>
                        <p className={`font-bold ${item.ehAbatimento ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>
                          {item.nome}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.isKg 
                            ? `${item.quantidade} kg x ${formatCurrency(item.preco/item.quantidade)}` 
                            : `${formatCurrency(item.preco)} un.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className={`text-lg font-bold ${item.ehAbatimento ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {item.ehAbatimento ? '-' : ''} {formatCurrency(item.isKg ? item.preco : (item.preco * item.quantidade))}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(mesa, item.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="w-full lg:w-[400px] bg-slate-50 dark:bg-slate-900 border-t lg:border-t-0 lg:border-l flex flex-col shadow-xl z-20">
          
          <div className="p-6 bg-white dark:bg-black m-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total a Pagar</span>
            <div className={`mt-2 text-5xl font-black tracking-tighter ${
              total > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300'
            }`}>
              {formatCurrency(total)}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-sm text-slate-500">
              <span>Itens lançados</span>
              <span>{mesa.itens.length}</span>
            </div>
          </div>

          <div className="flex-1 px-6 pb-6 space-y-3">
            <AddItemDialog mesa={mesa} produtos={produtos} onAddItem={onAddItem}/>

            <div className="grid grid-cols-2 gap-3">
              <AbateDialog mesa={mesa} onAbate={onAbate} total={total}/>
              <Button variant="outline" onClick={() => {handlePrintPDF(mesa, produtos); window.scrollTo({ top: 0, behavior: 'smooth' })}} className="h-12">
                <Printer className="mr-2 w-4 h-4 text-slate-500" /> Imprimir
              </Button>
            </div>

            <div className='grid grid-cols-1'>
              <LogsDialog mesa={mesa} />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-950 border-t mt-auto">
            <DeleteMesaDialog mesa={mesa} onDelete={async () => {await fetch(`/api/mesas/${mesa.id}`, { method: 'DELETE' }); await loadMesas()}}/>
            <Separator className="my-4" />
            <FinalizeDialog mesa={mesa} onFinalize={onFinalize} total={total} clientes={clientes}/>
          </div>
        </div>

      </div>
    </div>
  )
}