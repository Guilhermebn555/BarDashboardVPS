'use client'

import { Clock, DollarSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function MesaCard({ mesa, onClick }) {
  const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const total = mesa.itens.reduce((acc, item) => acc + (item.isKg ? parseFloat(item.preco) : item.preco * item.quantidade), 0)
  const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
  
  const timeDiff = Math.floor((new Date() - new Date(mesa.created_at)) / 1000 / 60)

  return (
    <Card 
      onClick={() => onClick(mesa)}
      className="group cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200 relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${total > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />

      <div className="p-5 pl-7">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{mesa.nome}</h3>
          <Badge variant="secondary" className="font-mono text-xs">
            {formatDate(mesa.created_at)}
          </Badge>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex items-center text-slate-400 text-xs gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeDiff} min</span>
          </div>
          
          <div className="text-right">
            <span className="text-xs text-slate-400 block mb-0.5">Total</span>
            <span className={`text-xl font-bold tracking-tight ${total > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}