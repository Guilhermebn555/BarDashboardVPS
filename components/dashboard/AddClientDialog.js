'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function AddClientDialog({ 
  open, 
  onOpenChange, 
  novoCliente, 
  setNovoCliente, 
  onAddClient 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={novoCliente.nome}
              onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
              placeholder="Nome completo do cliente"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={novoCliente.telefone}
                onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={novoCliente.email}
                onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="apelidos">Apelidos</Label>
            <Input
              id="apelidos"
              value={novoCliente.apelidos}
              onChange={(e) => setNovoCliente({...novoCliente, apelidos: e.target.value})}
              placeholder="Zé, Zezinho, José (separados por vírgula)"
            />
            <p className="text-xs text-muted-foreground mt-1">Separe múltiplos apelidos com vírgula</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dia_pagamento">Dia de Pagamento</Label>
              <Input
                id="dia_pagamento"
                type="number"
                min="1"
                max="31"
                value={novoCliente.dia_pagamento}
                onChange={(e) => setNovoCliente({...novoCliente, dia_pagamento: e.target.value})}
                placeholder="Dia do mês (1-31)"
              />
            </div>
            <div>
              <Label htmlFor="limite_credito">Limite de Crédito (R$)</Label>
              <Input
                id="limite_credito"
                type="number"
                step="0.1"
                value={novoCliente.limite_credito}
                onChange={(e) => setNovoCliente({...novoCliente, limite_credito: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags/Observações</Label>
            <Textarea
              id="tags"
              value={novoCliente.tags}
              onChange={(e) => setNovoCliente({...novoCliente, tags: e.target.value})}
              placeholder="VIP, Bom pagador, etc (separados por vírgula)"
              rows={2}
            />
            <p className="text-xs text-muted-foreground mt-1">Separe múltiplas tags com vírgula</p>
          </div>

          <Button onClick={onAddClient} className="w-full" disabled={!novoCliente.nome.trim()}>
            Adicionar Cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}