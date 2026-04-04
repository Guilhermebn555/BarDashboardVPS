'use client'

import { PackageX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EmprestimoCard } from './EmprestimoCard'

export function EmprestimoList({ emprestimos, searchQuery, onUpdate }) {
  const groupByDate = (lista) => {
    const groups = {}
    lista.forEach(item => {
      const dateKey = item.data_emprestimo
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(item)
    })
    return groups
  }

  const emprestimosGrouped = groupByDate(emprestimos)
  // Ordena as chaves de data pela data ISO do primeiro item do grupo para garantir a ordem cronológica
  const sortedDateKeys = Object.keys(emprestimosGrouped).sort((a, b) => {
    return new Date(emprestimosGrouped[b][0].data_iso) - new Date(emprestimosGrouped[a][0].data_iso)
  })

  if (emprestimos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
          <PackageX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Nenhum registro encontrado para essa busca.' : 'Nenhum empréstimo pendente.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {sortedDateKeys.map((dateKey) => {
        const emprestimosNoDia = emprestimosGrouped[dateKey]

        return (
          <div key={dateKey} className="space-y-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2">
              {dateKey}
            </h1>
            
            <div className="space-y-3">
              {emprestimosNoDia.map((emprestimo) => (
                <EmprestimoCard 
                  key={emprestimo.id} 
                  emprestimo={emprestimo} 
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