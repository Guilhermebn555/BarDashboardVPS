'use client'

import { Edit, Trash2, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ProductCard({ produto, onEdit, onDelete }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{produto.nome}</CardTitle>
          <div className="flex flex-col gap-1 items-end">
            {!produto.ativo && (
              <Badge variant="secondary">Inativo</Badge>
            )}
            {produto.valor_taxa > 0 && (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1">
                <Coins className="w-3 h-3" />
                +{formatCurrency(produto.valor_taxa)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(produto.preco)}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(produto)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(produto.id)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}