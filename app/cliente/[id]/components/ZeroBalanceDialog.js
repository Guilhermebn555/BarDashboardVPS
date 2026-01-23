'use client'

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export function ZeroBalanceDialog({ cliente, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')

  const handleZerar = async () => {
    try {
      const valorParaZerar = Math.abs(cliente.saldo)
      const res = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          tipo: 'abate',
          valor: valorParaZerar,
          dados: { forma_pagamento: formaPagamento, tipo_abate: 'zerar_conta' }
        })
      })
      if (res.ok) {
        onSuccess()
        setOpen(false)
        setFormaPagamento('dinheiro')
      }
    } catch (error) { console.error(error) }
  }

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="flex-1 sm:flex-none sm:h-11">
          <Zap className="w-4 h-4 mr-2" /> Zerar Conta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Zerar Conta</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-sm text-muted-foreground mb-1">Valor para zerar:</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(Math.abs(cliente.saldo))}</p>
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
          <Button onClick={handleZerar} className="w-full">Confirmar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}