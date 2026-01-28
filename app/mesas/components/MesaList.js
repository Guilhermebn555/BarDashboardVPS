'use client'

import { ShoppingBag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { MesaCard } from './MesaCard'

export function MesaList({ 
  mesas, 
  produtos, 
  clientes, 
  onAddItem, 
  onUpdateQuantidade, 
  onRemoveItem, 
  onFinalize, 
  onAbate, 
  onCloseMesa,
  onRefresh
}) {
  if (mesas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Nenhuma mesa aberta no momento</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {mesas.map((mesa) => (
        <MesaCard
          key={mesa.id}
          mesa={mesa}
          produtos={produtos}
          clientes={clientes}
          onAddItem={onAddItem}
          onUpdateQuantidade={onUpdateQuantidade}
          onRemoveItem={onRemoveItem}
          onFinalize={onFinalize}
          onAbate={onAbate}
          onCloseMesa={onCloseMesa}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}