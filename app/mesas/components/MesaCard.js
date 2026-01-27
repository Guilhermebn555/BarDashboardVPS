'use client'

import { Minus, Plus, Trash2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddItemDialog } from './AddItemDialog'
import { FinalizeDialog } from './FinalizeDialog'
import { AbateDialog } from './AbateDialog'
import { LogsDialog } from './LogsDialog'
import handlePrintPDF from '@/lib/pdf-mesas'


export function MesaCard({ 
  mesa, 
  produtos, 
  clientes, 
  onAddItem, 
  onUpdateQuantidade, 
  onRemoveItem, 
  onFinalize, 
  onAbate, 
  onCloseMesa 
}) {
  const getBalanceColor = (saldo) => saldo > 0 ? 'text-green-600 dark:text-green-400' : saldo < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600'
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const calcularTotal = (itens) => {
    return itens.reduce((total, item) => total + (item.preco * item.quantidade), 0)
  }

  const total = calcularTotal(mesa.itens)

  const printPDF = () => handlePrintPDF(mesa, total)

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg sm:text-xl truncate">{mesa.nome}</CardTitle>
              <LogsDialog mesa={mesa} />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {new Date(mesa.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            {mesa.observacoes && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 italic">
                Obs: {mesa.observacoes}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={printPDF}
              title="Imprimir Cupom"
            >
              <Printer className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCloseMesa(mesa.id)}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {mesa.itens.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item adicionado
            </p>
          ) : (
            mesa.itens.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded gap-2 sm:gap-0">
                <div className="flex-1">
                  <p className={`font-medium ${item.ehAbatimento ? 'text-red-500 dark:text-red-400' : ''}`}>
                    {item.nome}
                  </p>
                  {!item.ehAbatimento ? (
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.preco)} cada
                    </p>
                  ) : (
                    <p className="text-sm text-red-500 dark:text-red-400 italic">
                      Pagamento parcial
                    </p>
                  )}
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  {!item.ehAbatimento && (
                    <div className="flex items-center border rounded-md bg-white dark:bg-gray-900">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-none"
                        onClick={() => onUpdateQuantidade(mesa, item.id, item.quantidade - 1)}
                        disabled={item.quantidade <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantidade}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-none"
                        onClick={() => onUpdateQuantidade(mesa, item.id, item.quantidade + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className={`font-bold min-w-[4rem] text-right ${item.ehAbatimento ? 'text-red-500 dark:text-red-400' : ''}`}>
                      {formatCurrency(item.preco * item.quantidade)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(mesa, item.id)}
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className={`text-2xl font-bold ${getBalanceColor(total)}`}>
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <AddItemDialog 
            mesa={mesa} 
            produtos={produtos} 
            onAddItem={onAddItem} 
          />
          <FinalizeDialog 
            mesa={mesa} 
            clientes={clientes} 
            total={total} 
            onFinalize={onFinalize} 
          />
          <AbateDialog 
            mesa={mesa} 
            total={total} 
            onAbate={onAbate} 
          />
        </div>
      </CardContent>
    </Card>
  )
}