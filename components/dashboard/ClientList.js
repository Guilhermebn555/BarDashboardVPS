'use client'

import { useRouter } from 'next/navigation'
import { Users, Ban, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ClientList({ 
  loading, 
  displayedClientes, 
  hasActiveFilters, 
  resetFilters, 
  formatCurrency, 
  getBalanceColor 
}) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Carregando clientes...</p>
      </div>
    )
  }

  if (displayedClientes.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          {hasActiveFilters ? 'Nenhum cliente encontrado com os filtros aplicados' : 'Nenhum cliente cadastrado ainda'}
        </p>
        {hasActiveFilters && (
          <Button variant="outline" onClick={resetFilters} className="mt-4">
            Limpar Filtros
          </Button>
        )}
      </div>
    )
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'suspenso':
        return 'border-amber-400 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700'
      case 'cancelado':
        return 'border-red-400 bg-red-50 opacity-80 dark:bg-red-950/20 dark:border-red-800'
      default:
        return ''
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayedClientes.map((cliente) => (
        <Card 
          key={cliente.id}
          className={`cursor-pointer hover:shadow-lg transition-all relative overflow-hidden ${getStatusStyle(cliente.status)}`}
          onClick={() => router.push(`/cliente/${cliente.id}`)}
        >
          {cliente.status === 'suspenso' && (
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-2 py-1 rounded-bl flex items-center gap-1 z-10">
              <AlertTriangle className="w-3 h-3" /> Suspenso
            </div>
          )}
          {cliente.status === 'cancelado' && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-bl flex items-center gap-1 z-10">
              <Ban className="w-3 h-3" /> Cancelado
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>
                {cliente.nome}
              </span>
            </CardTitle>
            
            <div className="space-y-1 mt-1">
              {cliente.telefone && <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.telefone}</p>}
              {cliente.email && <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.email}</p>}
            </div>

            {cliente.dia_pagamento && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                Dia de pagamento: {cliente.dia_pagamento}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center border-t pt-3 border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Saldo:</span>
              <span className={`text-lg font-bold ${getBalanceColor(cliente.saldo)}`}>
                {formatCurrency(cliente.saldo)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}