'use client'

import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function LogsDialog({ mesa }) {
  const formatHoraLog = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400">
          <History className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Histórico - {mesa.nome}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto space-y-3 p-1">
          {mesa.logs && mesa.logs.length > 0 ? (
            [...mesa.logs].reverse().map((log, idx) => (
              <div key={idx} className="flex gap-2 text-sm border-b pb-2 last:border-0">
                <div className="text-xs text-gray-500 mt-0.5 min-w-[50px]">
                  {formatHoraLog(log.data)}
                </div>
                <div className="flex-1">
                  {log.mensagem}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhum registro encontrado.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}