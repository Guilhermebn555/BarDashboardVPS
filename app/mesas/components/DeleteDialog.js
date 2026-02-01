'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function DeleteMesaDialog({ mesa, onDelete }) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onDelete(mesa)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            variant="outline"
            className="w-full h-14 text-lg font-bold border-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all active:scale-95 mb-3"
        >
          <Trash2 className="mr-2 w-5 h-5" /> Cancelar / Excluir Mesa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-none shadow-2xl">
        
        <div className="bg-rose-600 p-6 transition-colors duration-300">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-white">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold">Excluir Mesa</span>
                        <span className="text-sm font-normal opacity-90 text-rose-100">
                           Ação destrutiva e irreversível
                        </span>
                    </div>
                </DialogTitle>
            </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
            
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl flex gap-4 items-start">
                <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-full shrink-0">
                    <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                    <h4 className="font-bold text-rose-800 dark:text-rose-200 text-lg">Tem certeza?</h4>
                    <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
                        Você está prestes a apagar a mesa <strong>"{mesa.nome}"</strong> e todos os {mesa.itens.length} itens lançados nela.
                    </p>
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-2 uppercase tracking-wide">
                        Isso não poderá ser desfeito.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    className="h-14 font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                    <XCircle className="mr-2 w-5 h-5" /> Cancelar
                </Button>

                <Button
                    onClick={handleConfirm}
                    className="h-14 text-lg font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20 transition-all active:scale-95"
                >
                    <Trash2 className="mr-2 w-5 h-5" /> Sim, Excluir
                </Button>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}