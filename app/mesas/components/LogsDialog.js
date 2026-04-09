'use client'

import { 
  History,
  PlusCircle,
  Trash2,
  Edit2,
  DollarSign,
  Info,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { formatTime } from '@/lib/formatters'

export function LogsDialog({ mesa }) {
  
  const getLogStyle = (tipo) => {
    switch (tipo) {
      case 'add':
        return { 
          icon: PlusCircle, 
          color: 'text-emerald-600 dark:text-emerald-400', 
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          border: 'border-emerald-200 dark:border-emerald-800'
        }
      case 'remove':
        return { 
          icon: Trash2, 
          color: 'text-red-600 dark:text-red-400', 
          bg: 'bg-red-100 dark:bg-red-900/30',
          border: 'border-red-200 dark:border-red-800'
        }
      case 'update':
        return { 
          icon: Edit2, 
          color: 'text-blue-600 dark:text-blue-400', 
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          border: 'border-blue-200 dark:border-blue-800'
        }
      case 'money':
        return { 
          icon: DollarSign, 
          color: 'text-amber-600 dark:text-amber-400', 
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          border: 'border-amber-200 dark:border-amber-800'
        }
      default:
        return { 
          icon: Info, 
          color: 'text-slate-600 dark:text-slate-400', 
          bg: 'bg-slate-100 dark:bg-slate-800',
          border: 'border-slate-200 dark:border-slate-700'
        }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full h-12 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <History className="mr-2 w-4 h-4" /> Ver Histórico
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-none shadow-2xl">
        <div className="bg-slate-900 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <History className="w-5 h-5 text-white" />
                </div>
                <div>
                    <DialogTitle className="text-white text-lg font-bold">Histórico de Atividades</DialogTitle>
                    <p className="text-slate-400 text-xs">Mesa: {mesa.nome}</p>
                </div>
            </div>
            <Badge variant="outline" className="text-slate-300 border-slate-700 bg-slate-800">
                {mesa.logs?.length || 0} Registros
            </Badge>
        </div>

        <div className="p-0">
          <ScrollArea className="h-[400px] w-full p-6">
            {mesa.logs && mesa.logs.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6 pb-2">
                
                {[...mesa.logs].reverse().map((log, idx) => {
                  const style = getLogStyle(log.tipo)
                  const Icon = style.icon

                  return (
                    <div key={idx} className="relative pl-8 group">
                      <div className={`absolute -left-[9px] top-5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 shadow-sm ${style.bg} ${style.color} flex items-center justify-center`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${style.bg.replace('/30', '')} bg-current`} />
                      </div>

                      <div className={`p-3 rounded-xl border ${style.border} bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3`}>
                         
                         <div className={`p-2 rounded-lg shrink-0 ${style.bg} ${style.color}`}>
                            <Icon className="w-4 h-4" />
                         </div>

                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">
                                {log.mensagem}
                            </p>
                         </div>

                         <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded shrink-0">
                            <Clock className="w-3 h-3" />
                            {formatTime(log.data)}
                         </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                <History className="w-12 h-12 mb-3 opacity-20" />
                <p>Nenhum registro encontrado.</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}