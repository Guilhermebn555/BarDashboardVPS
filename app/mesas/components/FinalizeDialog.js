'use client'

import { useState } from 'react'
import { DollarSign, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function FinalizeDialog({ mesa, clientes, total, onFinalize }) {
  const [open, setOpen] = useState(false)
  const [tipoPagamento, setTipoPagamento] = useState('vista')
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [observacoesCompra, setObservacoesCompra] = useState('')

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const handleConfirm = () => {
    onFinalize(mesa, {
      tipoPagamento,
      clienteSelecionado,
      formaPagamento,
      observacoesCompra,
      total
    })
    setOpen(false)
    // Reset states
    setTipoPagamento('vista')
    setClienteSelecionado('')
    setFormaPagamento('dinheiro')
    setObservacoesCompra('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1" disabled={mesa.itens.length === 0}>
          <DollarSign className="w-4 h-4 mr-2" />
          Finalizar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Mesa - {mesa.nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <p className="text-sm text-muted-foreground mb-1">Total a pagar:</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(total)}
            </p>
          </div>

          <div>
            <Label>Forma de Pagamento *</Label>
            <Select value={tipoPagamento} onValueChange={setTipoPagamento}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vista">À Vista (Pago)</SelectItem>
                <SelectItem value="fiado">Fiado (Caderneta)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipoPagamento === 'vista' && (
            <div>
              <Label>Método de Pagamento *</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
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
          )}

          {tipoPagamento === 'fiado' && (
            <>
              <div>
                <Label>Cliente *</Label>
                <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {cliente.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="observacoesCompra">Observações (Opcional)</Label>
                <Textarea
                  id="observacoesCompra"
                  value={observacoesCompra}
                  onChange={(e) => setObservacoesCompra(e.target.value)}
                  placeholder="Observações sobre esta compra..."
                  rows={3}
                />
              </div>
            </>
          )}

          <Button
            onClick={handleConfirm}
            className="w-full"
            disabled={(tipoPagamento === 'fiado' && !clienteSelecionado) || total <= 0}
          >
            Confirmar e Finalizar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}