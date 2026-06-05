'use client'

import { Mic, Loader2 } from 'lucide-react'
import { PedidoCard } from './PedidoCard'

export function FilaList({ fila, loading, onTocar, onExcluir }) {
  if (loading) {
    return (
      <div className="flex justify-center py-20 text-amber-500">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    )
  }

  if (fila.length === 0) {
    return (
      <div className="mt-20 text-center text-zinc-500">
        <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-bold uppercase tracking-widest">A fila está vazia</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {fila.map((pedido, index) => (
        <PedidoCard
          key={pedido.id}
          pedido={pedido}
          index={index}
          onTocar={onTocar}
          onExcluir={onExcluir}
        />
      ))}
    </div>
  )
}