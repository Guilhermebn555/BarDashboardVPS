'use client'

import { useState } from 'react'
import { AlertTriangle, Calendar, Edit, Trash2, FileDown, Settings, Ban, PauseCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { EditClientDialog } from './EditClientDialog'
import { PdfDialog } from './PdfDialog'
import { useRouter } from 'next/navigation'

export function ClientInfo({ cliente, onUpdate }) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  
  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const getBalanceColor = (saldo) => saldo > 0 ? 'text-green-600 dark:text-green-400' : saldo < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600'

  const limiteEstourado = cliente.limite_credito > 0 && cliente.saldo < -cliente.limite_credito

  const handleDeletarCliente = async () => {
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao deletar')
      alert('Cliente deletado com sucesso!')
      router.push('/')
    } catch (error) {
      console.error(error)
      alert('Erro ao deletar')
    }
  }

  const handleUpdateStatus = async (novoStatus) => {
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      })
      
      if (res.ok) {
        onUpdate()
        setShowStatusModal(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-6">
          <div className="flex-1 min-w-0 w-full">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{cliente.nome}</h2>
            {cliente.tags && <p className="text-sm text-gray-600 dark:text-gray-400">({cliente.tags.join(', ')})</p>}
            {cliente.telefone && <p className="text-sm text-gray-600 dark:text-gray-400">{cliente.telefone}</p>}
            {cliente.email && <p className="text-sm text-gray-600 dark:text-gray-400 break-all">{cliente.email}</p>}
            {cliente.limite_credito > 0 && <p className="text-sm text-gray-600 dark:text-gray-400">Limite: {formatCurrency(cliente.limite_credito)}</p>}
            {cliente.dia_pagamento && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" /> <span>Dia de pagamento: {cliente.dia_pagamento}</span>
              </div>
            )}
          </div>
          
          <div className="w-full lg:w-auto lg:text-right">
            <div className="flex gap-2 mb-4 justify-end">
              <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="text-gray-600 border-gray-500 hover:bg-gray-50">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerenciar Status da Conta</DialogTitle>
                    <DialogDescription>Alterar o status atual do cliente.</DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3 py-4">
                    {cliente.status !== 'ativo' && (
                      <Button onClick={() => handleUpdateStatus('ativo')} className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-2" /> Ativar Conta
                      </Button>
                    )}
                    {cliente.status !== 'suspenso' && (
                      <Button onClick={() => handleUpdateStatus('suspenso')} className="bg-amber-500 hover:bg-amber-600 text-white">
                        <PauseCircle className="w-4 h-4 mr-2" /> Suspender Conta
                      </Button>
                    )}
                    {cliente.status !== 'cancelado' && (
                      <Button onClick={() => handleUpdateStatus('cancelado')} variant="destructive">
                        <Ban className="w-4 h-4 mr-2" /> Cancelar Conta
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <EditClientDialog cliente={cliente} onUpdate={onUpdate} />
              
              <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="text-red-600 border-red-500 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Você tem certeza absoluta?</DialogTitle>
                    <DialogDescription>
                      Isso irá deletar permanentemente o cliente <strong>{cliente.nome}</strong> e todo o seu histórico.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleDeletarCliente}>Sim, deletar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <PdfDialog cliente={cliente} />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Saldo Atual</p>
            <p className={`text-2xl sm:text-4xl font-bold ${getBalanceColor(cliente.saldo)}`}>
              {formatCurrency(cliente.saldo)}
            </p>
          </div>
        </div>
        {limiteEstourado && (
            <div className="bg-amber-600 flex items-center justify-center gap-2 mt-2 text-white-600 dark:text-white-500 font-bold animate-pulse rounded-md">
                <AlertTriangle className="w-4 h-4" />
                <span>Limite de Crédito Excedido!</span>
            </div>
        )}
      </div>
    </div>
  )
}