'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, AlertTriangle, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

import { ClientInfo } from './components/ClientInfo'
import { NewPurchaseDialog } from './components/NewPurchaseDialog'
import { PaymentDialog } from './components/PaymentDialog'
import { ZeroBalanceDialog } from './components/ZeroBalanceDialog'
import { TransactionList } from './components/TransactionList'
import { useConfirmExit } from '@/hooks/useConfirmExit'

export default function ClientePage() {
  const router = useRouter()
  const params = useParams()
  const clienteId = params.id

  const [cliente, setCliente] = useState(null)
  const [transacoes, setTransacoes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmExit, setConfirmExit] = useState(false)

  useConfirmExit(confirmExit);

  useEffect(() => {
    if (clienteId) {
      loadCliente()
      loadProdutos()
    }
  }, [clienteId])

  const loadCliente = async () => {
    try {
      const res = await fetch(`/api/clientes/${clienteId}`)
      const data = await res.json()
      setCliente(data.cliente)
      setTransacoes(data.transacoes || [])
    } catch (error) {
      console.error('Error loading client:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProdutos = async () => {
    try {
      const res = await fetch('/api/produtos')
      const data = await res.json()
      setProdutos(data.produtos?.filter(p => p.ativo) || [])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cliente não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Cliente</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {cliente.status === 'suspenso' && (
        <div className="bg-amber-500 text-white p-6 sm:p-10 text-center animate-in slide-in-from-top duration-300">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="w-16 h-16 sm:w-24 sm:h-24" />
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider">CONTA SUSPENSA</h1>
            <p className="text-lg sm:text-xl font-medium max-w-2xl">
              Esta conta está temporariamente suspensa. NENHUMA NOVA COMPRA DEVE SER REALIZADA.
            </p>
          </div>
        </div>
      )}

      {cliente.status === 'cancelado' && (
        <div className="bg-red-600 text-white p-6 sm:p-10 text-center animate-in slide-in-from-top duration-300">
          <div className="flex flex-col items-center gap-4">
            <Ban className="w-16 h-16 sm:w-24 sm:h-24" />
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider">CONTA CANCELADA</h1>
            <p className="text-lg sm:text-xl font-medium max-w-2xl">
              Esta conta foi cancelada permanentemente e não deve realizar novas operações.
            </p>
          </div>
        </div>
      )}

      <ClientInfo 
        cliente={cliente} 
        onUpdate={loadCliente} 
      />

      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 pb-6 sm:pb-8 pt-2">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            
            <NewPurchaseDialog 
              clienteId={clienteId} 
              produtos={produtos} 
              onSuccess={loadCliente}
              setConfirmExit={setConfirmExit}
            />

            <PaymentDialog 
              clienteId={clienteId} 
              onSuccess={loadCliente} 
            />

            {cliente.saldo < 0 && (
              <ZeroBalanceDialog 
                cliente={cliente} 
                onSuccess={loadCliente} 
              />
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Histórico de Transações</h3>
        <TransactionList transacoes={transacoes} />
      </main>
    </div>
  )
}