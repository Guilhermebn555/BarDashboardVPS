'use client'

import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Printer,
  Minus,
  Clock, 
  Utensils,
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
import { EditMesaDialog } from './EditMesaDialog'
import { MesaObservacoes } from './MesaObservacoes'

export function MesaWorkspace({ 
  mesa, 
  onBack, 
  onAddItem, 
  onFinalize, 
  onAbate, 
  onRemoveItem,
  produtos,
  clientes,
  onUpdateQuantidade,
  onUpdateMesa
}) {
  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const formatTime = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
  
  const total = mesa.itens.reduce((acc, item) => {
    const val = item.isKg ? parseFloat(item.preco) : (item.preco * item.quantidade)
    return acc + val
  }, 0)

  const handleSaveObs = async (novaObs) => {
    await onUpdateMesa(mesa.id, { observacoes: novaObs })
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-slate-950 rounded-none md:rounded-xl border-0 md:border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
      
      <div className="bg-white dark:bg-slate-900 border-b p-3 md:p-4 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
          </Button>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 md:gap-3">
              <h1 className="text-lg md:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                {mesa.nome}
              </h1>
              <EditMesaDialog mesa={mesa} onUpdate={onUpdateMesa} />
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-[10px] md:text-xs shrink-0">
                Aberta
              </Badge>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
            <Clock className="text-slate-500 w-3 h-3 md:w-4 md:h-4" />
            <span className="text-slate-500 truncate">Início: {formatTime(mesa.created_at)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white dark:bg-slate-950/50 order-1 lg:order-1">
          <MesaObservacoes observacoesIniciais={mesa.observacoes} onSave={handleSaveObs} />
          <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-900/50 border-b text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between shrink-0">
            <span>Itens ({mesa.itens.length})</span>
            <span>Subtotal</span>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 md:p-4 pb-20 lg:pb-4">
              {mesa.itens.length === 0 ? (
                <div className="h-[40vh] flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
                  <Utensils className="w-12 h-12 md:w-16 md:h-16" />
                  <p className="text-base md:text-lg font-medium text-center px-4">Nenhum item lançado ainda</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {mesa.itens.map((item) => (
                    <div 
                      key={item.id}
                      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl border transition-all active:scale-[0.99] touch-manipulation ${
                        item.ehAbatimento 
                          ? 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900' 
                          : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 w-full">
                        
                        <div className="shrink-0">
                          {!item.isKg && !item.ehAbatimento ? (
                            <div className="flex items-center h-8 md:h-10 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-sm">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-full w-8 rounded-none hover:bg-white dark:hover:bg-slate-800 text-slate-500 active:bg-slate-200"
                                disabled={item.quantidade <= 1}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onUpdateQuantidade(mesa, item.id, item.quantidade - 1)
                                }}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>

                              <span className="w-6 md:w-8 text-center text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                                {item.quantidade}
                              </span>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-full w-8 rounded-none hover:bg-white dark:hover:bg-slate-800 text-blue-600 hover:text-blue-700 active:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onUpdateQuantidade(mesa, item.id, item.quantidade + 1)
                                }}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className={`flex items-center justify-center w-10 h-8 md:h-10 rounded-lg font-bold text-xs md:text-sm ${
                              item.ehAbatimento ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {item.isKg ? 'Kg' : item.quantidade}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm md:text-base font-bold truncate leading-tight ${item.ehAbatimento ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>
                            {item.nome}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-400 mt-1">
                            {item.isKg 
                              ? `${item.quantidade} kg x ${formatCurrency(item.preco/item.quantidade)}` 
                              : `${formatCurrency(item.preco)} un.`}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 sm:hidden">
                            <span className={`text-sm font-bold ${item.ehAbatimento ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                                {item.ehAbatimento ? '-' : ''} {formatCurrency(item.isKg ? item.preco : (item.preco * item.quantidade))}
                            </span>
                             <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemoveItem(mesa, item.id)}
                                className="h-6 w-6 text-slate-300 active:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-6 pl-4 border-l border-transparent sm:border-slate-100 dark:sm:border-slate-800 ml-4">
                        <span className={`text-lg font-bold whitespace-nowrap ${item.ehAbatimento ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                          {item.ehAbatimento ? '-' : ''} {formatCurrency(item.isKg ? item.preco : (item.preco * item.quantidade))}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(mesa, item.id)}
                          className="text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="w-full lg:w-[400px] bg-slate-50 dark:bg-slate-900 border-t lg:border-t-0 lg:border-l flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-xl z-20 shrink-0">
          
          <div className="p-4 lg:p-6 bg-white dark:bg-black lg:m-6 rounded-none lg:rounded-2xl border-b lg:border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center lg:block">
                <span className="text-xs lg:text-sm font-semibold text-slate-400 uppercase tracking-wider">Total a Pagar</span>
                
                <div className="lg:hidden text-xs text-slate-400">
                    {mesa.itens.length} itens
                </div>
            </div>

            <div className={`mt-0 lg:mt-2 text-3xl md:text-5xl font-black tracking-tighter ${
              total > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300'
            }`}>
              {formatCurrency(total)}
            </div>
            
            <Separator className="hidden lg:block my-4" />
            
            <div className="hidden lg:flex justify-between text-sm text-slate-500">
              <span>Itens lançados</span>
              <span>{mesa.itens.length}</span>
            </div>
          </div>

          <div className="flex-1 px-4 py-3 lg:px-6 lg:pb-6 space-y-2 lg:space-y-3 bg-slate-50 dark:bg-slate-900">
            <AddItemDialog mesa={mesa} produtos={produtos} onAddItem={onAddItem}/>

            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              <AbateDialog mesa={mesa} onAbate={onAbate} total={total}/>
              <Button 
                variant="outline" 
                onClick={() => {handlePrintPDF(mesa, total); window.scrollTo({ top: 0, behavior: 'smooth' })}} 
                className="h-12 border-dashed border-gray-400 hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-950/20 text-gray-600 dark:text-gray-300"
              >
                <Printer className="mr-2 w-3 h-3 lg:w-4 lg:h-4 text-slate-500" /> Imprimir
              </Button>
            </div>
            
            <div className='hidden lg:grid grid-cols-1'>
              <LogsDialog mesa={mesa} />
            </div>
          </div>

          <div className="p-4 lg:p-6 bg-white dark:bg-slate-950 border-t mt-auto safe-area-bottom">
            <div className="flex gap-2 lg:block lg:space-y-4">
                 <div className="hidden lg:block">
                    <DeleteMesaDialog mesa={mesa} onDelete={async () => {await fetch(`/api/mesas/${mesa.id}`, { method: 'DELETE' }); await loadMesas()}}/>
                    <Separator className="my-4" />
                 </div>
                 <div className="w-full">
                    <FinalizeDialog mesa={mesa} onFinalize={onFinalize} total={total} clientes={clientes}/>
                 </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}