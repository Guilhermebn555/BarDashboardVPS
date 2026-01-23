'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function TransactionList({ transacoes }) {
  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))

  if (transacoes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          Nenhuma transação registrada
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {transacoes.map((transacao) => (
        <Card key={transacao.id}>
          <CardContent className="py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <Badge variant={transacao.tipo === 'compra' ? 'destructive' : 'default'} className={transacao.tipo !== 'compra' ? 'bg-green-600' : ''}>
                    {transacao.tipo === 'compra' ? 'Compra' : 'Pagamento'}
                  </Badge>
                  <span className="text-xs sm:text-sm text-gray-500">{formatDate(transacao.created_at)}</span>
                </div>

                {transacao.dados?.itens && transacao.dados.itens.length > 0 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {transacao.dados.itens.map((item, idx) => (
                      <div key={idx}>
                        <span className="text-blue-600 font-bold">{item.quantidade}x </span>
                        {item.nome}
                      </div>
                    ))}
                  </div>
                )}

                {transacao.dados?.desconto_aplicado > 0 && (
                  <div className="text-xs text-red-500 mt-1 font-semibold">
                    Desconto: -{formatCurrency(transacao.dados.desconto_aplicado)}
                  </div>
                )}

                {transacao.observacoes && <p className="text-sm text-blue-600 mt-2 italic">Obs: {transacao.observacoes}</p>}
                {transacao.dados?.forma_pagamento && <p className="text-xs text-muted-foreground mt-1">Forma: {transacao.dados.forma_pagamento}</p>}
              </div>

              <div className="w-full sm:w-auto sm:text-right">
                <p className={`text-lg sm:text-xl font-bold ${transacao.tipo === 'compra' ? 'text-red-600' : 'text-green-600'}`}>
                  {transacao.tipo === 'compra' ? '-' : '+'} {formatCurrency(transacao.valor)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}