'use client'

import { useState } from 'react'
import { Settings, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function ManageProdutosDialog({ produtos, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [novoProduto, setNovoProduto] = useState('')

  const handleCadastrar = async (e) => {
    e.preventDefault()
    if (!novoProduto.trim()) return

    try {
      const res = await fetch('/api/produtos-emprestimo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoProduto })
      })

      if (res.ok) {
        setNovoProduto('')
        onSuccess()
      }
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error)
    }
  }

  const handleRemover = async (id, nome) => {
    if (!confirm(`Remover "${nome}" da lista de opções?`)) return

    try {
      await fetch(`/api/produtos-emprestimo?id=${id}`, { method: 'DELETE' })
      onSuccess()
    } catch (error) {
      console.error('Erro ao remover produto:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Settings className="w-4 h-4 mr-2" />
          Itens
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Gerenciar Itens (Mesas/Vasilhames)</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-2">
          
          <form onSubmit={handleCadastrar} className="flex gap-2">
            <Input
              value={novoProduto}
              onChange={(e) => setNovoProduto(e.target.value)}
              placeholder="Novo item..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!novoProduto.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3 max-h-60 overflow-y-auto">
            <ul className="space-y-1">
              {produtos.length === 0 ? (
                <li className="text-sm text-gray-500 text-center py-4">Nenhum item cadastrado</li>
              ) : (
                produtos.map((prod) => (
                  <li key={prod.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded group transition-colors">
                    <span className="font-medium">{prod.nome}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500 opacity-50 group-hover:opacity-100"
                      onClick={() => handleRemover(prod.id, prod.nome)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}