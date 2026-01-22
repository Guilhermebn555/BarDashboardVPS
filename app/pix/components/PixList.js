'use client'

import { DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { PixCard } from './PixCard'

export function PixList({ compras, clientes, searchQuery, onUpdate }) {
  const formatDateExtended = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ]
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    return `${day} de ${month} de ${year}`
  }

  const groupByDate = (compras) => {
    const groups = {}
    compras.forEach(compra => {
      const dateKey = new Date(compra.created_at).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(compra)
    })
    return groups
  }

  const comprasGrouped = groupByDate(compras)
  const sortedDateKeys = Object.keys(comprasGrouped).sort((a, b) => new Date(b) - new Date(a))

  if (compras.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Nenhuma compra encontrada' : 'Nenhuma compra registrada'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {sortedDateKeys.map((dateKey) => {
        const comprasNoDia = comprasGrouped[dateKey]
        const dataFormatada = formatDateExtended(comprasNoDia[0].created_at)

        return (
          <div key={dateKey} className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 border-b-2 pb-2">
              {dataFormatada}
            </h1>
            
            <div className="space-y-3">
              {comprasNoDia.map((compra) => (
                <PixCard 
                  key={compra.id} 
                  compra={compra} 
                  clientes={clientes} 
                  onUpdate={onUpdate} 
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}