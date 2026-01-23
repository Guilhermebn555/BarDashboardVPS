'use client'

import { useState, useEffect } from 'react'
import { Edit, Save, Loader2, User, Phone, Mail, Calendar, CreditCard, Tag, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function EditClientDialog({ cliente, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    nome: '',
    apelidos: '',
    telefone: '',
    email: '',
    dia_pagamento: '',
    limite_credito: '',
    tags: ''
  })

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome || '',
        apelidos: cliente.apelidos ? cliente.apelidos.join(', ') : '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        dia_pagamento: cliente.dia_pagamento || '',
        limite_credito: cliente.limite_credito || '',
        tags: cliente.tags ? cliente.tags.join(', ') : ''
      })
    }
  }, [cliente, open])

  const handleSave = async () => {
    if (!form.nome.trim()) {
      alert('O nome é obrigatório')
      return
    }

    setLoading(true)

    try {
      const payload = {
        nome: form.nome,
        apelidos: form.apelidos ? form.apelidos.split(',').map(s => s.trim()).filter(Boolean) : [],
        telefone: form.telefone || null,
        email: form.email || null,
        dia_pagamento: form.dia_pagamento ? parseInt(form.dia_pagamento) : null,
        limite_credito: form.limite_credito ? parseFloat(form.limite_credito) : 0,
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : []
      }

      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erro ao atualizar')
      }

      onUpdate()
      setOpen(false)
      alert('Cliente atualizado com sucesso!')
    } catch (error) {
      console.error(error)
      alert(`Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-blue-600 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-blue-700">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Nome Completo *
              </Label>
              <Input 
                id="nome" 
                value={form.nome} 
                onChange={e => setForm({...form, nome: e.target.value})} 
                placeholder="Nome completo do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apelidos" className="flex items-center gap-2">
                Apelidos
              </Label>
              <Input 
                id="apelidos" 
                value={form.apelidos} 
                onChange={e => setForm({...form, apelidos: e.target.value})} 
                placeholder="Ex: Zé, Zezinho, José"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Telefone
              </Label>
              <Input 
                id="telefone" 
                value={form.telefone} 
                onChange={e => setForm({...form, telefone: e.target.value})} 
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                placeholder="cliente@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dia_pagamento" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Dia de Pagamento
              </Label>
              <Input 
                id="dia_pagamento" 
                type="number" 
                min="1" 
                max="31" 
                value={form.dia_pagamento} 
                onChange={e => setForm({...form, dia_pagamento: e.target.value})} 
                placeholder="Dia (1-31)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limite_credito" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Limite de Crédito (R$)
              </Label>
              <Input 
                id="limite_credito" 
                type="number" 
                step="0.1" 
                value={form.limite_credito} 
                onChange={e => setForm({...form, limite_credito: e.target.value})} 
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center gap-2">
              <Tag className="w-4 h-4" /> Tags
            </Label>
            <Textarea 
              id="tags" 
              value={form.tags} 
              onChange={e => setForm({...form, tags: e.target.value})} 
              placeholder="VIP, Bom pagador, etc"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}