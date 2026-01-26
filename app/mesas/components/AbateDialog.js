'use client'

import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AbateDialog({ mesa, total, onAbate }) {
  const [open, setOpen] = useState(false)
  const [valorAbater, setValorAbater] = useState('')
  const [metodoPagamentoAbater, setMetodoPagamentoAbater] = useState('dinheiro')

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const handleConfirm = () => {
    onAbate(mesa, {
      valorAbater,
      metodoPagamentoAbater,
      total
    })
    setOpen(false)
    setValorAbater('')
    setMetodoPagamentoAbater('dinheiro')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="flex-1">
          <DollarSign className="w-4 h-4 mr-2" />
          Abater
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abater Valor - {mesa.nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-sm text-muted-foreground mb-1">Valor Atual:</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(total)}
            </p>
          </div>

          <div>
            <Label htmlFor="valorAbater">Valor a Abater *</Label>
            <Input
              id="valorAbater"
              type="number"
              step="0.01"
              value={valorAbater}
              onChange={(e) => setValorAbater(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Método de Pagamento *</Label>
            <Select value={metodoPagamentoAbater} onValueChange={setMetodoPagamentoAbater}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleConfirm}
            className="w-full"
            disabled={!valorAbater}
          >
            Confirmar e Abater
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}