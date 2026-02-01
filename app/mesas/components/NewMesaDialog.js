'use client'

import { useState } from 'react'
import { Plus, PenLine, User, CheckCircle2, Armchair } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function NewMesaDialog({ onCreate }) {
  const [open, setOpen] = useState(false)
  const [nomeMesa, setNomeMesa] = useState('')
  const [observacoesMesa, setObservacoesMesa] = useState('')

  const handleCreate = () => {
    onCreate(nomeMesa, observacoesMesa)
    setOpen(false)
    setNomeMesa('')
    setObservacoesMesa('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Mesa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-none shadow-2xl">
        
        <div className="bg-blue-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Armchair className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span>Abrir Nova Mesa</span>
                <span className="text-sm font-normal opacity-90 text-blue-100">
                  Inicie um novo atendimento
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          
          <div className="space-y-3">
            <Label htmlFor="nomeMesa" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Identificação *
            </Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <Input
                id="nomeMesa"
                value={nomeMesa}
                onChange={(e) => setNomeMesa(e.target.value)}
                placeholder="Ex: Mesa 05 ou Nome do Cliente"
                className="h-14 pl-12 text-lg font-medium bg-white dark:bg-slate-900 border-slate-200 focus-visible:ring-0 focus-visible:border-blue-500 transition-all rounded-xl shadow-sm"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-400 pl-1">
              Use o número da mesa ou o nome do cliente para identificar.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="observacoesMesa" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Observações (Opcional)
            </Label>
            <div className="relative group">
              <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <PenLine className="w-5 h-5" />
              </div>
              <Textarea
                id="observacoesMesa"
                value={observacoesMesa}
                onChange={(e) => setObservacoesMesa(e.target.value)}
                placeholder="Alguma observação inicial?"
                rows={3}
                className="pl-12 pt-4 min-h-[100px] text-base bg-white dark:bg-slate-900 border-slate-200 focus-visible:ring-0 focus-visible:border-blue-500 transition-all rounded-xl shadow-sm resize-none"
              />
            </div>
          </div>

          <Button 
            onClick={handleCreate} 
            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 rounded-xl transition-all active:scale-95"
            disabled={!nomeMesa.trim()}
          >
            <CheckCircle2 className="mr-2 w-6 h-6" />
            Confirmar Abertura
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  )
}