'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Scale, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export function ProductForm({ open, onOpenChange, onSubmit, editingProduto, addingProduto }) {
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    categoria: '',
    ativo: true,
    valor_taxa: '',
    isKg: false
  })

  useEffect(() => {
    if (editingProduto) {
      setFormData({
        nome: editingProduto.nome,
        preco: editingProduto.preco.toString(),
        categoria: editingProduto.categoria || '',
        ativo: editingProduto.ativo,
        valor_taxa: editingProduto.valor_taxa && editingProduto.valor_taxa > 0 ? editingProduto.valor_taxa.toString() : '',
        isKg: editingProduto.isKg || false
      })
    } else {
      setFormData({ nome: '', preco: '', categoria: '', ativo: true, valor_taxa: '', isKg: false })
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingProduto ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border">
            <Checkbox 
              id="isKg" 
              checked={formData.isKg}
              onCheckedChange={(checked) => setFormData({ ...formData, isKg: checked })}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="isKg"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Venda por Quilo (Kg)
              </label>
              <p className="text-xs text-muted-foreground">
                Ative se o preço for baseado no peso (ex: Buffet, Carnes).
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder={formData.isKg ? "Ex: Buffet Livre" : "Ex: Coca-Cola 350ml"}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="preco" className="flex items-center gap-2">
              {formData.isKg ? (
                <><Scale className="w-4 h-4 text-blue-500" /> Preço por Quilo (R$/kg) *</>
              ) : (
                <><Package className="w-4 h-4 text-green-500" /> Preço Unitário (R$) *</>
              )}
            </Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              placeholder="0.00"
              className={formData.isKg ? "border-blue-300 focus-visible:ring-blue-500" : ""}
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
            <Label htmlFor="valor_taxa" className="text-amber-800 dark:text-amber-200 font-semibold text-xs uppercase tracking-wider">
              Taxa Extra (Fiado)
            </Label>
            <Input
              id="valor_taxa"
              type="number"
              step="0.01"
              value={formData.valor_taxa}
              onChange={(e) => setFormData({ ...formData, valor_taxa: e.target.value })}
              placeholder="0.00"
              className="bg-white dark:bg-gray-900"
            />
            <p className="text-[10px] text-muted-foreground leading-tight">
              Valor somado automaticamente no caderno de fiado.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!formData.nome || !formData.preco || parseFloat(formData.preco) <= 0 || addingProduto}
          >
            {addingProduto ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              editingProduto ? 'Salvar Alterações' : 'Cadastrar Produto'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}