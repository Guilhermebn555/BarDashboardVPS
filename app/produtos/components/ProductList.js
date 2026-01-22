'use client'

import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from './ProductCard'

export function ProductList({ produtos, loading, onEdit, onDelete }) {
  const groupByCategoria = () => {
    const grouped = {}
    produtos.forEach(p => {
      const cat = p.categoria || 'Sem Categoria'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(p)
    })
    return grouped
  }

  const grouped = groupByCategoria()

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Carregando produtos...</p>
      </div>
    )
  }

  if (produtos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Nenhum produto cadastrado ainda</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([categoria, items]) => (
        <div key={categoria}>
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{categoria}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((produto) => (
              <ProductCard
                key={produto.id}
                produto={produto}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}