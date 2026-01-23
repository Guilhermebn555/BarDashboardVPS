'use client'

import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PaymentDialog({ clienteId, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [valorAbate, setValorAbate] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')

  const handleAbater = async () => {
    if (!valorAbate || parseFloat(valorAbate) <= 0) return
    try {
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteId,
          tipo: 'abate',
          valor: parseFloat(valorAbate),
          dados: { forma_pagamento: formaPagamento }
        })
      })
      if (res.ok) {
        onSuccess()
        setOpen(false)
        setValorAbate('')
        setFormaPagamento('dinheiro')
      }
    } catch (error) { console.error(error) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex-1 sm:h-11">
          <DollarSign className="w-4 h-4 mr-2" /> Abater Dinheiro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar Pagamento</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Valor Pago *</Label>
            <Input type="number" step="0.01" value={valorAbate} onChange={(e) => setValorAbate(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <Label>Forma de Pagamento</Label>
            <Select value={formaPagamento} onValueChange={setFormaPagamento}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAbater} className="w-full" disabled={!valorAbate}>Registrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}