'use client'

import { useState } from 'react'
import { Check, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'

export function EmprestimoCard({ emprestimo, onUpdate }) {
  const [showMarcarDevolvido, setShowMarcarDevolvido] = useState(false)
  const [showDeletar, setShowDeletar] = useState(false)

  // Cálculo de atraso
  const hoje = new Date()
  const dataEmprestimo = new Date(emprestimo.data_iso)
  const diasAtraso = Math.floor((hoje - dataEmprestimo) / (1000 * 60 * 60 * 24))
  const isAtrasado = diasAtraso > 30 && !emprestimo.devolvido

  const handleMarcarDevolvido = async () => {
    try {
      const res = await fetch(`/api/emprestimos/${emprestimo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devolvido: true })
      })

      if (res.ok) {
        onUpdate()
        setShowMarcarDevolvido(false)
      }
    } catch (error) {
      console.error('Erro ao marcar como devolvido:', error)
    }
  }

  const handleDeletar = async () => {
    try {
      await fetch(`/api/emprestimos/${emprestimo.id}`, { method: 'DELETE' })
      onUpdate()
      setShowDeletar(false)
    } catch (error) {
      console.error('Erro ao deletar empréstimo:', error)
    }
  }

  return (
    <Card className={`transition-all duration-200 ${
      emprestimo.devolvido ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : 
      isAtrasado ? 'border-red-500 shadow-sm shadow-red-500/20' : ''
    }`}>
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
              <span className={`text-lg sm:text-xl font-bold flex items-center gap-1 ${
                emprestimo.devolvido ? 'text-gray-500 line-through' : 
                isAtrasado ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'
              }`}>
                <Clock className="w-4 h-4" />
                {emprestimo.hora}
              </span>
              <span className={`text-base sm:text-lg font-semibold truncate ${
                emprestimo.devolvido ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'
              }`}>
                - {emprestimo.nome}
              </span>
              
              {/* Badges */}
              {emprestimo.devolvido && (
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 rounded text-xs font-bold uppercase border border-green-200 dark:border-green-800">
                  Devolvido
                </span>
              )}
              {isAtrasado && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 rounded text-xs font-bold uppercase border border-red-200 dark:border-red-800 animate-pulse">
                  {diasAtraso} dias atrasado
                </span>
              )}
            </div>
            
            <div className="space-y-1 mb-3">
              {emprestimo.itens && emprestimo.itens.map((item, idx) => (
                <div key={idx} className="text-sm flex items-center gap-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {item.quantidade}x 
                  </span>
                  <span className={emprestimo.devolvido ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}>
                    {item.nome}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            {!emprestimo.devolvido && (
              <Dialog open={showMarcarDevolvido} onOpenChange={setShowMarcarDevolvido}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto hover:text-green-600 hover:border-green-600">
                    <Check className="w-4 h-4 mr-1" />
                    Receber
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Devolução</DialogTitle>
                    <DialogDescription>
                      Deseja confirmar que o cliente devolveu os itens?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowMarcarDevolvido(false)}>Cancelar</Button>
                    <Button onClick={handleMarcarDevolvido}>Confirmar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={showDeletar} onOpenChange={setShowDeletar}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deletar Registro</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja apagar este empréstimo do histórico? Esta ação é irreversível.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeletar(false)}>Cancelar</Button>
                  <Button variant="destructive" onClick={handleDeletar}>Deletar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}