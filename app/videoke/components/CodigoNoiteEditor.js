'use client'

import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export function CodigoNoiteEditor({ codigoNoite, onUpdate }) {
  const [editando, setEditando] = useState(false)
  const [novoCodigo, setNovoCodigo] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [showErro, setShowErro] = useState(false)
  const [mensagemErro, setMensagemErro] = useState('')

  const abrirEdicao = () => {
    setNovoCodigo(codigoNoite ?? '')
    setEditando(true)
  }

  const cancelar = () => {
    setNovoCodigo('')
    setEditando(false)
  }

  const handleSalvar = async () => {
    const valor = novoCodigo.trim()
    if (!/^\d{4}$/.test(valor)) {
      setMensagemErro('O PIN deve ter exatamente 4 dígitos.')
      setShowErro(true)
      return
    }
    if (valor === codigoNoite) {
      setEditando(false)
      return
    }

    setSalvando(true)
    try {
      const res = await fetch('/api/configuracoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin_atual: valor })
      })

      if (res.ok) {
        const data = await res.json()
        onUpdate(data?.configuracao?.pin_atual ?? valor)
        setEditando(false)
      } else {
        const erro = await res.json().catch(() => ({}))
        setMensagemErro(erro?.erro || 'Erro ao salvar o código.')
        setShowErro(true)
      }
    } catch (error) {
      console.error('Erro ao salvar código:', error)
      setMensagemErro('Erro ao salvar o código.')
      setShowErro(true)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Código</span>
        {editando ? (
          <div className="flex items-center gap-1">
            <Input
              autoFocus
              value={novoCodigo}
              onChange={(e) => setNovoCodigo(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSalvar()
                if (e.key === 'Escape') cancelar()
              }}
              inputMode="numeric"
              maxLength={4}
              placeholder="0000"
              className="w-20 text-center font-mono text-base font-bold tracking-[0.3em] text-amber-400"
            />
            <Button size="icon" variant="outline" onClick={handleSalvar} disabled={salvando} className="h-9 w-9">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={cancelar} disabled={salvando} className="h-9 w-9">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={abrirEdicao}
            disabled={codigoNoite === null}
            className="font-mono text-base font-bold tracking-[0.3em] text-amber-400"
          >
            {codigoNoite === null ? '••••' : (codigoNoite || '----')}
            <Pencil className="w-3 h-3 ml-2 opacity-60" />
          </Button>
        )}
      </div>

      <Dialog open={showErro} onOpenChange={setShowErro}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atenção</DialogTitle>
            <DialogDescription>{mensagemErro}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErro(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}