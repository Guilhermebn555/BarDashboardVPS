'use client'

import { Mic } from 'lucide-react'
import { CodigoNoiteEditor } from './CodigoNoiteEditor'
import { SomToggle } from './SomToggle'

export function VideokeHeader({ totalPedidos, codigoNoite, onUpdateCodigo, somAtivo, onToggleSom }) {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/90 px-6 py-4 backdrop-blur-md shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-zinc-950">
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">Painel do DJ</h1>
          <p className="text-xs font-bold text-amber-500 tracking-widest">BAR DO ROLDÃO</p>
        </div>
      </div>

      <CodigoNoiteEditor codigoNoite={codigoNoite} onUpdate={onUpdateCodigo} />

      <div className="flex items-center gap-3">
        <SomToggle somAtivo={somAtivo} onToggle={onToggleSom} />
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {totalPedidos} Pedidos
        </div>
      </div>
    </header>
  )
}