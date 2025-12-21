'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Edit, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ProdutosPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingProduto, setEditingProduto] = useState(null)

  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    categoria: '',
    ativo: true
  })

  useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    try {
      const res = await fetch('/api/produtos')
      const data = await res.json()
      setProdutos(data.produtos || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.nome || !formData.preco || parseFloat(formData.preco) <= 0) return

    try {
      const url = editingProduto ? `/api/produtos/${editingProduto.id}` : '/api/produtos'
      const method = editingProduto ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          preco: parseFloat(formData.preco),
          categoria: formData.categoria,
          ativo: formData.ativo
        })
      })

      if (res.ok) {
        await loadProdutos()
        setShowAdd(false)
        setEditingProduto(null)
        setFormData({ nome: '', preco: '', categoria: '', ativo: true })
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  }

  const handleEdit = (produto) => {
    setEditingProduto(produto)
    setFormData({
      nome: produto.nome,
      preco: produto.preco.toString(),
      categoria: produto.categoria || '',
      ativo: produto.ativo
    })
    setShowAdd(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadProdutos()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const groupByCategoria = () => {
    const grouped = {}
    produtos.forEach(p => {
      const cat = p.categoria || 'Sem Categoria'
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(p)
    })
    return grouped
  }

  const grouped = groupByCategoria()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Produtos</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Catálogo de Produtos</h2>
          <Dialog open={showAdd} onOpenChange={(open) => {
            setShowAdd(open)
            if (!open) {
              setEditingProduto(null)
              setFormData({ nome: '', preco: '', categoria: '', ativo: true })
            }
          }}>
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
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Nome do produto"
                  />
                </div>
                <div>
                  <Label htmlFor="preco">Preço *</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    placeholder="Ex: Bebidas, Alimentos, etc."
                  />
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
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Carregando produtos...</p>
          </div>
        ) : produtos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum produto cadastrado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([categoria, items]) => (
              <div key={categoria}>
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">{categoria}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((produto) => (
                    <Card key={produto.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{produto.nome}</CardTitle>
                          {!produto.ativo && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
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
                            onClick={() => handleEdit(produto)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(produto.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
