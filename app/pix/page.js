'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogoutButton } from '@/components/logout-button'
import { NewPixDialog } from './components/NewPixDialog'
import { PixList } from './components/PixList'

export default function PixPage() {
  const router = useRouter()
  const [compras, setCompras] = useState([])
  const [comprasFiltradas, setComprasFiltradas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCompras()
    loadProdutos()
    loadClientes()
  }, [])

  const loadCompras = async () => {
    try {
      const res = await fetch('/api/compras-pix')
      const data = await res.json()
      const comprasAtivas = (data.compras || []).filter(c => !c.enviado_para_cliente)
      setCompras(comprasAtivas)
      setComprasFiltradas(comprasAtivas)
    } catch (error) {
      console.error('Error loading compras:', error)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setComprasFiltradas(compras)
    } else {
      const filtered = compras.filter(c => 
        c.nome_cliente?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setComprasFiltradas(filtered)
    }
  }, [searchQuery, compras])

  const loadProdutos = async () => {
    try {
      const res = await fetch('/api/produtos')
      const data = await res.json()
      setProdutos(data.produtos?.filter(p => p.ativo) || [])
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const loadClientes = async () => {
    try {
      const res = await fetch('/api/clientes')
      const data = await res.json()
      setClientes(data.clientes || [])
    } catch (error) {
      console.error('Error loading clients:', error)
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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Compras PIX</h1>
            </div>
            <div className="flex gap-2 items-center">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-12"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Lista de Compras ({comprasFiltradas.length})</h2>
          <NewPixDialog 
            produtos={produtos} 
            onSuccess={loadCompras} 
          />
        </div>

        <PixList 
          compras={comprasFiltradas} 
          clientes={clientes} 
          searchQuery={searchQuery}
          onUpdate={loadCompras}
        />
      </main>
    </div>
  )
}