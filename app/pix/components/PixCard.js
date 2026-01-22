'use client'

import { useState } from 'react'
import { Check, Send, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export function PixCard({ compra, clientes, onUpdate }) {
  const [showMarcarPago, setShowMarcarPago] = useState(false)
  const [showEnviarCliente, setShowEnviarCliente] = useState(false)
  const [showDeletar, setShowDeletar] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState('')

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  const formatTime = (dateString) => new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const handleMarcarPago = async () => {
    try {
      const res = await fetch(`/api/compras-pix/${compra.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago: true })
      })

      if (res.ok) {
        onUpdate()
        setShowMarcarPago(false)
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
    }
  }

  const handleEnviarParaCliente = async () => {
    if (!clienteSelecionado) {
      alert('Selecione um cliente')
      return
    }

    try {
      const descricao = compra.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ')

      const transacaoRes = await fetch('/api/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: clienteSelecionado,
          tipo: 'compra',
          valor: compra.total,
          dados: {
            descricao,
            itens: compra.itens,
            origem: 'pix',
            horario_original: compra.created_at
          }
        })
      })

      if (!transacaoRes.ok) {
        alert('Erro ao enviar para cliente')
        return
      }

      await fetch(`/api/compras-pix/${compra.id}`, { method: 'DELETE' })

      onUpdate()
      setShowEnviarCliente(false)
      setClienteSelecionado('')
      alert('Compra enviada para a conta do cliente!')
    } catch (error) {
      console.error('Error sending to client:', error)
      alert('Erro ao enviar para cliente')
    }
  }

  const handleDeletar = async () => {
    try {
      await fetch(`/api/compras-pix/${compra.id}`, { method: 'DELETE' })
      onUpdate()
      setShowDeletar(false)
    } catch (error) {
      console.error('Error deleting compra:', error)
    }
  }

  return (
    <Card className={`${compra.pago ? 'opacity-60' : ''} transition-opacity`}>
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className={`flex-1 min-w-0 ${compra.pago ? 'line-through' : ''}`}>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatTime(compra.created_at)}
              </span>
              <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 truncate">
                - {compra.nome_cliente}
              </span>
              {compra.pago && (
                <span className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs sm:text-sm font-semibold">
                  PAGO
                </span>
              )}
            </div>
            <div className="space-y-1 mb-3">
              {compra.itens.map((item, idx) => (
                <div key={idx} className="text-sm">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {item.quantidade}x{' '}
                  </span>
                  {item.nome} - {formatCurrency(item.preco)}
                </div>
              ))}
            </div>
            <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
              Total: {formatCurrency(compra.total)}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {!compra.pago && (
              <Dialog open={showMarcarPago} onOpenChange={setShowMarcarPago}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Check className="w-4 h-4 mr-1" />
                    Pago
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Pagamento</DialogTitle>
                    <DialogDescription>
                      Deseja marcar esta compra como paga? A compra será riscada na lista.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowMarcarPago(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleMarcarPago}>
                      Confirmar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={showEnviarCliente} onOpenChange={(open) => {
                setShowEnviarCliente(open)
                if (!open) setClienteSelecionado('')
              }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-1" />
                  Enviar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar para Conta Fiado</DialogTitle>
                  <DialogDescription>
                    Selecione o cliente para enviar esta compra. O horário original ({formatTime(compra.created_at)}) será mantido.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEnviarCliente(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleEnviarParaCliente} disabled={!clienteSelecionado}>
                    Enviar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showDeletar} onOpenChange={setShowDeletar}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja deletar esta compra? Esta ação não pode ser desfeita.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeletar(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleDeletar}>
                    Deletar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}