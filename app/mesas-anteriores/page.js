'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, CreditCard, User, ScrollText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { MesaItens } from './components/MesaItens'

export default function MesasAnterioresPage() {
  const router = useRouter()
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  
  useEffect(() => {
    fetchHistorico()
  }, [])

  const fetchHistorico = async () => {
    try {
      const res = await fetch('/api/mesas-anteriores')
      const data = await res.json()
      setHistorico(data.historico || [])
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Histórico de Mesas (Últimos 10 dias)" 
        logout={false}
        arrow={true}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/mesas')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Mesas Abertas
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Nenhuma mesa finalizada nos últimos 10 dias.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historico.map((item) => (
              <Card key={item.id} className={item.foi_fiado ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.nome_mesa}</CardTitle>
                    {item.foi_fiado ? (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                        Fiado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                        Pago
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(item.data_fechamento).toLocaleString('pt-BR')}
                  </p>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-lg">{formatCurrency(item.total)}</span>
                  </div>

                  <div className="space-y-1">
                     <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>{item.forma_pagamento.charAt(0).toUpperCase() + item.forma_pagamento.slice(1)}</span>
                     </div>
                     {item.foi_fiado && (
                       <div className="flex items-center text-amber-700 dark:text-amber-500 font-medium">
                          <User className="w-4 h-4 mr-2" />
                          <span>Cliente: {item.cliente_nome}</span>
                       </div>
                     )}
                  </div>

                  {item.itens && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Resumo do consumo:</p>
                      <p className="text-xs line-clamp-2">
                        {item.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ')}
                      </p>
                    </div>
                  )}

                  {item.logs && item.logs.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                            <ScrollText className="w-3 h-3 mr-2" />
                            Ver Logs da Mesa
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Logs - {item.nome_mesa}</DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {item.logs.slice().reverse().map((log, index) => (
                              <div key={index} className="text-sm border-b pb-2 last:border-0">
                                <p className="text-gray-800 dark:text-gray-200">{log.mensagem}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(log.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  <MesaItens mesa={item} />
                  
                  <div className="pt-2 text-[10px] text-gray-400 text-center">
                     Disponível até: {new Date(new Date(item.data_fechamento).setDate(new Date(item.data_fechamento).getDate() + 10)).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}