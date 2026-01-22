'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export function ProductForm({ open, onOpenChange, onSubmit, editingProduto }) {
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    categoria: '',
    ativo: true,
    valor_taxa: ''
  })

  useEffect(() => {
    if (editingProduto) {
      setFormData({
        nome: editingProduto.nome,
        preco: editingProduto.preco.toString(),
        categoria: editingProduto.categoria || '',
        ativo: editingProduto.ativo,
        valor_taxa: editingProduto.valor_taxa && editingProduto.valor_taxa > 0 ? editingProduto.valor_taxa.toString() : ''
      })
    } else {
      setFormData({ nome: '', preco: '', categoria: '', ativo: true, valor_taxa: '' })
    }
  }, [editingProduto, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingProduto ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do produto"
            />
          </div>
          <div>
            <Label htmlFor="preco">Preço Base *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              placeholder="Ex: Bebidas, Alimentos, etc."
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-800 space-y-2">
            <Label htmlFor="valor_taxa" className="text-amber-800 dark:text-amber-200">Taxa Extra (Fiado)</Label>
            <Input
              id="valor_taxa"
              type="number"
              step="0.01"
              value={formData.valor_taxa}
              onChange={(e) => setFormData({ ...formData, valor_taxa: e.target.value })}
              placeholder="0.00"
              className="bg-white dark:bg-gray-900"
            />
            <p className="text-xs text-muted-foreground">
              Valor a ser somado automaticamente quando vendido no caderno de fiado. Deixe 0.00 (padrão) para não cobrar taxas.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.nome || !formData.preco || parseFloat(formData.preco) <= 0}
          >
            {editingProduto ? 'Salvar Alterações' : 'Adicionar Produto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}