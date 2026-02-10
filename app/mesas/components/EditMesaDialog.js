'use client'

import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function EditMesaDialog({ mesa, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState(mesa.nome)
  const [observacoes, setObservacoes] = useState(mesa.observacoes || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
      setObservacoes(mesa.observacoes || '')
    }, [mesa.observacoes])

  const handleSave = async () => {
    try {
      setLoading(true)
      await onUpdate(mesa.id, { nome, observacoes })
    } catch (error) {
      console.error("Erro ao atualizar", error)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-24 ml-2 border-[1px] border-dashed border-gray-400 hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-950/20 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <Pencil className="w-4 h-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950">
        <DialogHeader>
          <DialogTitle>Editar Detalhes da Mesa</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome / Identificação</Label>
            <Input
              id="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              placeholder="Ex: Metade da Conta, foi paga por outro cliente, etc..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="col-span-3 min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}