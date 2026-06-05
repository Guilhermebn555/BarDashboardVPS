'use client'

import { useState } from 'react'
import { Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export function PedidoCard({ pedido, index, onTocar, onExcluir }) {

  return (
    <div className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700">
      <div className="flex items-center gap-4">
        <div className="w-6 text-center text-xs font-black text-zinc-600">#{index + 1}</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 text-cyan-400 font-mono text-lg font-bold shadow-inner">
          {pedido.codigo}
        </div>
        <div>
          <h3 className="font-bold text-zinc-100 text-lg leading-tight">{pedido.titulo}</h3>
          <p className="text-amber-500/80 text-sm font-medium">{pedido.cantor}</p>
        </div>
      </div>

        <Button variant="destructive" size="icon" onClick={() => onExcluir(pedido.id)}>
            <Trash2 className="w-4 h-4" />
        </Button>
    </div>
  )
}