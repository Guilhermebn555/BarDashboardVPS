'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Mesa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nomeMesa">Nome da Mesa *</Label>
            <Input
              id="nomeMesa"
              value={nomeMesa}
              onChange={(e) => setNomeMesa(e.target.value)}
              placeholder="Ex: João, Mesa 1, etc."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Digite o nome do cliente ou número da mesa
            </p>
          </div>
          <div>
            <Label htmlFor="observacoesMesa">Observações (Opcional)</Label>
            <Textarea
              id="observacoesMesa"
              value={observacoesMesa}
              onChange={(e) => setObservacoesMesa(e.target.value)}
              placeholder="Observações sobre esta mesa..."
              rows={3}
            />
          </div>
          <Button onClick={handleCreate} className="w-full" disabled={!nomeMesa.trim()}>
            Criar Mesa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}