'use client'

import { useState, useEffect } from 'react'
import { Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { NewEmprestimoDialog } from './components/NewEmprestimoDialog'
import { ManageProdutosDialog } from './components/ManageProdutosDialog'
import { EmprestimoList } from './components/EmprestimoList'

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState([])
  const [emprestimosFiltrados, setEmprestimosFiltrados] = useState([])
  const [produtos, setProdutos] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filtros
  const [showRecebidos, setShowRecebidos] = useState(false)
  const [showAtrasados, setShowAtrasados] = useState(false)

  useEffect(() => {
    loadEmprestimos()
    loadProdutos()
  }, [])

  const loadEmprestimos = async () => {
    try {
      const res = await fetch('/api/emprestimos')
      const data = await res.json()
      setEmprestimos(data.emprestimos || [])
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error)
    }
  }

  const loadProdutos = async () => {
    try {
      const res = await fetch('/api/produtos-emprestimo')
      const data = await res.json()
      setProdutos(data.produtos || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  useEffect(() => {
    let filtrados = emprestimos
    const hoje = new Date()

    // Filtro de Texto
    if (searchQuery.trim() !== '') {
      filtrados = filtrados.filter(e => 
        e.nome?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filtro de Status
    filtrados = filtrados.filter(item => {
      if (showAtrasados) {
        if (item.devolvido) return false
        const dataDoEmprestimo = new Date(item.data_iso)
        const diferencaEmDias = (hoje - dataDoEmprestimo) / (1000 * 60 * 60 * 24)
        if (diferencaEmDias <= 30) return false
      } else {
        if (!showRecebidos && item.devolvido) return false
      }
      return true
    })

    setEmprestimosFiltrados(filtrados)
  }, [searchQuery, emprestimos, showRecebidos, showAtrasados])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Gestão de Empréstimos"
        logout={false}
        arrow={true}
      />

      <main className="container mx-auto px-4 py-8">
        
        {/* Barra de Pesquisa e Filtros Rápidos */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="relative w-full md:max-w-md group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
            </div>
            <Input
              type="text"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 w-full bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-full focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all shadow-sm"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant={showRecebidos ? "default" : "outline"} 
              className={showRecebidos ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              onClick={() => {
                setShowRecebidos(!showRecebidos)
                if (showAtrasados) setShowAtrasados(false)
              }}
              size="sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Recebidos
            </Button>
            
            <Button 
              variant={showAtrasados ? "destructive" : "outline"} 
              onClick={() => {
                setShowAtrasados(!showAtrasados)
                if (!showAtrasados) setShowRecebidos(false)
              }}
              size="sm"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              +30 Dias
            </Button>
          </div>
        </div>

        {/* Cabeçalho da Lista e Botões de Ação */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Registros ({emprestimosFiltrados.length})
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <ManageProdutosDialog 
              produtos={produtos} 
              onSuccess={loadProdutos} 
            />
            <NewEmprestimoDialog 
              produtos={produtos} 
              onSuccess={loadEmprestimos} 
            />
          </div>
        </div>

        {/* Lista de Cards */}
        <EmprestimoList 
          emprestimos={emprestimosFiltrados} 
          searchQuery={searchQuery}
          onUpdate={loadEmprestimos}
        />

      </main>
    </div>
  )
}