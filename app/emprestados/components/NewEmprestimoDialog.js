'use client'

import { useState } from 'react'
import { Plus, Trash2, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export function NewEmprestimoDialog({ produtos, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [nomeCliente, setNomeCliente] = useState('')
  const [itensNoCarrinho, setItensNoCarrinho] = useState([])
  
  // Estados para o item atual que está sendo selecionado
  const [produtoSelecionado, setProdutoSelecionado] = useState('')
  const [quantidade, setQuantidade] = useState('1')

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionado || parseInt(quantidade) <= 0) return
    
    // Se o item já estiver no carrinho, apenas soma a quantidade
    const itemExistente = itensNoCarrinho.find(i => i.nome === produtoSelecionado)
    if (itemExistente) {
      setItensNoCarrinho(itensNoCarrinho.map(i => 
        i.nome === produtoSelecionado ? { ...i, quantidade: i.quantidade + parseInt(quantidade) } : i
      ))
    } else {
      setItensNoCarrinho([...itensNoCarrinho, { nome: produtoSelecionado, quantidade: parseInt(quantidade) }])
    }
    
    setProdutoSelecionado('')
    setQuantidade('1')
  }

  const removerDoCarrinho = (nome) => {
    setItensNoCarrinho(itensNoCarrinho.filter(i => i.nome !== nome))
  }

  const handleFinalizar = async () => {
    try {
      const dataAtual = new Date()
      const res = await fetch('/api/emprestimos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeCliente,
          itens: itensNoCarrinho, // Enviando o array completo
          data_emprestimo: dataAtual.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
          hora: dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          data_iso: dataAtual.toISOString(),
        })
      })

      if (res.ok) {
        onSuccess()
        setOpen(false)
        setNomeCliente('')
        setItensNoCarrinho([])
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Novo Empréstimo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[40vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Saída de Itens</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label>Nome do Cliente *</Label>
            <Input value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} placeholder="Ex: Marcos (Mesa 10)" />
          </div>

          <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900/50 space-y-3">
            <Label className="text-xs uppercase text-gray-500 font-bold">Adicionar Itens</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                  <SelectTrigger><SelectValue placeholder="Item..." /></SelectTrigger>
                  <SelectContent>
                    {produtos.map(p => <SelectItem key={p.id} value={p.nome}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input type="number" className="w-20" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
              <Button type="button" variant="secondary" onClick={adicionarAoCarrinho} disabled={!produtoSelecionado}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Carrinho / Lista de Itens */}
          {itensNoCarrinho.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Itens selecionados:
              </h4>
              {itensNoCarrinho.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded border shadow-sm">
                  <span className="text-sm">
                    <b className="text-blue-500">{item.quantidade}x</b> {item.nome}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removerDoCarrinho(item.nome)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleFinalizar} className="w-full" disabled={!nomeCliente || itensNoCarrinho.length === 0}>
            Finalizar Empréstimo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}