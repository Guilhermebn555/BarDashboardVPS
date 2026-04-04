'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export function NewEmprestimoDialog({ produtos, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [nomeCliente, setNomeCliente] = useState('')
  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFinalizar = async () => {
    if (!nomeCliente.trim() || !produtoSelecionado || !quantidade) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsSubmitting(true)
    try {
      const dataAtual = new Date()
      
      const res = await fetch('/api/emprestimos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCliente,
          item_nome: produtoSelecionado,
          quantidade: parseInt(quantidade),
          data_emprestimo: dataAtual.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
          hora: dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          data_iso: dataAtual.toISOString(),
          devolvido: false
        })
      })

      if (res.ok) {
        onSuccess()
        setOpen(false)
        setNomeCliente('')
        setProdutoSelecionado('')
        setQuantidade('1')
      } else {
        const errorData = await res.json()
        alert('Erro: ' + (errorData.error || 'Falha ao registrar'))
      }
    } catch (error) {
      console.error('Erro ao salvar empréstimo:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Empréstimo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Saída</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
            <Input
              id="nomeCliente"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              placeholder="Ex: Roldão Vizinho"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label>Item *</Label>
              <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o item..." />
                </SelectTrigger>
                <SelectContent>
                  {produtos.length === 0 ? (
                    <SelectItem value="nenhum" disabled>Cadastre produtos primeiro</SelectItem>
                  ) : (
                    produtos.map((p) => (
                      <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantidade">Qtd *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleFinalizar}
            className="w-full mt-4"
            disabled={!nomeCliente.trim() || !produtoSelecionado || isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Empréstimo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}