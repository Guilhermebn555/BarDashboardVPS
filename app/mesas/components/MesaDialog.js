// components/MesaDialog.jsx
'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Printer, Receipt, Calendar, Clock, Utensils, Info } from "lucide-react"
import handlePrintPDF from '@/lib/pdf-mesas'

export function MesaDialog({ mesa, isOpen, onOpenChange }) {
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  
  const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(date))
  const formatTime = (date) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(date))

  const calcularTotal = (itens) => {
    return itens.reduce((total, item) => {
      const valorItem = item.isKg ? parseFloat(item.preco) : (parseFloat(item.preco) * parseInt(item.quantidade));
      return total + valorItem;
    }, 0)
  }

  const total = calcularTotal(mesa.itens)
  const printPDF = () => handlePrintPDF(mesa, total)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-950 text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Utensils className="w-5 h-5 text-emerald-400" />
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  {mesa.nome}
                </DialogTitle>
              </div>
              <div className="flex gap-3 text-slate-400 text-xs font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(mesa.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTime(mesa.created_at)}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 px-3 py-1 mr-5">
              Mesa Ativa
            </Badge>
          </div>
          
          {mesa.observacoes && (
            <div className="flex items-start gap-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-300 italic">"{mesa.observacoes}"</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-950">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resumo do Pedido</p>
          <ScrollArea className="h-[300px] pr-4">
            {mesa.itens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Receipt className="w-12 h-12 mb-2 opacity-20" />
                <p>Nenhum item lançado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mesa.itens.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      item.ehAbatimento 
                      ? "bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30" 
                      : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm"
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 dark:text-slate-100">{item.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                           {item.isKg ? `${parseFloat(item.quantidade).toFixed(3)}kg` : `${item.quantidade}x`}
                         </Badge>
                         <span className="text-xs text-slate-500">
                           {formatCurrency(item.isKg ? (item.preco / item.quantidade) : item.preco)} un.
                         </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black ${item.ehAbatimento ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {formatCurrency(item.isKg ? item.preco : (item.preco * item.quantidade))}
                      </p>
                      {item.ehAbatimento && <span className="text-[10px] font-bold text-red-400 uppercase">Abatimento</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg font-bold text-slate-500 uppercase tracking-widest">Subtotal acumulado:</p>
            <div className="text-right">
              <span className={`text-3xl font-black tracking-tighter ${
                total >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'
              }`}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 justify-between items-center">
            <Button 
              className="flex-1 bg-slate-950 hover:bg-slate-800 text-white font-bold h-12 rounded-xl transition-all active:scale-95"
              onClick={printPDF}
            >
              <Printer className="mr-2 h-5 w-5" />
              Imprimir Conferência
            </Button>
            <Button 
              variant="outline" 
              className="h-12 w-15 rounded-xl border-slate-200 dark:border-slate-800"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}