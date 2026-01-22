'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ProductForm } from './components/ProductForm'
import { ProductList } from './components/ProductList'

export default function ProdutosPage() {
  const router = useRouter()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingProduto, setEditingProduto] = useState(null)

  useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    try {
      const res = await fetch('/api/produtos')
      const data = await res.json()
      setProdutos(data.produtos || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
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
          ativo: formData.ativo,
          valor_taxa: formData.valor_taxa ? parseFloat(formData.valor_taxa) : 0
        })
      })

      if (res.ok) {
        await loadProdutos()
        setShowAdd(false)
        setEditingProduto(null)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleEdit = (produto) => {
    setEditingProduto(produto)
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
      console.error(error)
    }
  }

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
          <ProductForm 
            open={showAdd} 
            onOpenChange={(open) => {
              setShowAdd(open)
              if (!open) setEditingProduto(null)
            }}
            onSubmit={handleSave}
            editingProduto={editingProduto}
          />
        </div>

        <ProductList 
          produtos={produtos} 
          loading={loading} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </main>
    </div>
  )
}