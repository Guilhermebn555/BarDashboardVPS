'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { NewMesaDialog } from './components/NewMesaDialog'
import { MesaList } from './components/MesaList'

export default function MesasPage() {
  const router = useRouter()
  const [mesas, setMesas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [clientes, setClientes] = useState([])

  useEffect(() => {
    loadProdutos()
    loadClientes()
    loadMesas()
  }, [])

  const loadMesas = async () => {
    try {
      const res = await fetch('/api/mesas')
      const data = await res.json()
      setMesas(data.mesas || [])
    } catch (error) {
      console.error('Error loading mesas:', error)
    }
  }

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

  const gerarLog = (mensagem, tipo = 'info') => {
    return {
      data: new Date().toISOString(),
      mensagem,
      tipo
    }
  }

  const handleCreateMesa = async (nome, observacoes) => {
    try {
      const res = await fetch('/api/mesas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome,
          itens: [],
          observacoes: observacoes || null,
          logs: [gerarLog(`Mesa ${nome} aberta.`)]
        })
      })

      if (res.ok) {
        await loadMesas()
      }
    } catch (error) {
      console.error('Error creating mesa:', error)
    }
  }

  const handleAdicionarItem = async (mesa, { produtoSelecionado, quantidade, modoPersonalizado, produtoPersonalizado }) => {
    let novoItem
    let logMsg

    if (modoPersonalizado) {
      novoItem = {
        id: Date.now().toString(),
        nome: produtoPersonalizado.nome,
        preco: parseFloat(produtoPersonalizado.preco),
        quantidade: parseInt(quantidade),
        ehAbatimento: false
      }
      logMsg = `Adicionou ${quantidade}x ${produtoPersonalizado.nome} (Manual)`
    } else {
      let precoFinal = produtoSelecionado.preco
      let temTaxa = false
      
      if (produtoSelecionado.valor_taxa && parseFloat(produtoSelecionado.valor_taxa) > 0) {
        precoFinal += parseFloat(produtoSelecionado.valor_taxa)
        temTaxa = true
      }

      novoItem = {
        id: Date.now().toString(),
        produto_id: produtoSelecionado.id,
        nome: produtoSelecionado.nome,
        preco: precoFinal, 
        quantidade: parseInt(quantidade),
        ehAbatimento: false
      }
      
      logMsg = `Adicionou ${quantidade}x ${produtoSelecionado.nome}`
      if(temTaxa) logMsg += ` (Taxa inclusa)`
    }

    try {
      const itensAtualizados = [...mesa.itens, novoItem]
      const logsAtualizados = [...(mesa.logs || []), gerarLog(logMsg, 'add')]

      const res = await fetch(`/api/mesas/${mesa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: mesa.nome,
          itens: itensAtualizados,
          observacoes: mesa.observacoes,
          logs: logsAtualizados
        })
      })

      if (res.ok) {
        await loadMesas()
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleUpdateQuantidade = async (mesa, itemId, novaQuantidade) => {
    try {
      let nomeItem = ''
      const itensAtualizados = mesa.itens.map(item => {
        if (item.id === itemId) {
          nomeItem = item.nome
          return { ...item, quantidade: novaQuantidade }
        }
        return item
      })

      const logsAtualizados = [...(mesa.logs || []), gerarLog(`Alterou ${nomeItem} para ${novaQuantidade}x`, 'update')]

      const res = await fetch(`/api/mesas/${mesa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: mesa.nome,
          itens: itensAtualizados,
          observacoes: mesa.observacoes,
          logs: logsAtualizados
        })
      })

      if (res.ok) {
        await loadMesas()
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleRemoverItem = async (mesa, itemId) => {
    try {
      const itemRemovido = mesa.itens.find(i => i.id === itemId)
      const itensAtualizados = mesa.itens.filter(item => item.id !== itemId)
      
      const logsAtualizados = [...(mesa.logs || []), gerarLog(`Removeu ${itemRemovido?.nome}`, 'remove')]

      const res = await fetch(`/api/mesas/${mesa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: mesa.nome,
          itens: itensAtualizados,
          observacoes: mesa.observacoes,
          logs: logsAtualizados
        })
      })

      if (res.ok) {
        await loadMesas()
      }
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const handleAbater = async (mesa, { valorAbater, metodoPagamentoAbater, total }) => {
    const valor = parseFloat(valorAbater)

    const itemAbatimento = {
      id: Date.now().toString(),
      nome: `Abatimento (${metodoPagamentoAbater})`,
      preco: -valor, 
      quantidade: 1,
      ehAbatimento: true
    }

    try {
      const itensAtualizados = [...mesa.itens, itemAbatimento]
      const logsAtualizados = [...(mesa.logs || []), gerarLog(`Abateu R$ ${valor.toFixed(2)} (${metodoPagamentoAbater})`, 'money')]

      const res = await fetch(`/api/mesas/${mesa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: mesa.nome,
          itens: itensAtualizados,
          observacoes: mesa.observacoes,
          logs: logsAtualizados
        })
      })

      if (res.ok) {
        await loadMesas()
      }
    } catch (error) {
      console.error('Error abating value:', error)
    }
  }

  const handleFinalize = async (mesa, { tipoPagamento, clienteSelecionado, formaPagamento, observacoesCompra, total }) => {
    if (tipoPagamento === 'fiado') {
      mesa.itens.forEach(async i => {
        if (i.ehAbatimento) {
          const pos = Math.abs(i.preco)
          const preco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pos)
          i.nome = `${i.quantidade}x ${i.nome} - ${preco}`
        }
      })
      try {
        await fetch('/api/transacoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cliente_id: clienteSelecionado,
            tipo: 'compra',
            valor: total,
            dados: { 
              mesa: mesa.nome,
              itens: mesa.itens,
              logs: mesa.logs
            },
            observacoes: observacoesCompra || null
          })
        })

        alert('Consumo registrado na caderneta do cliente!')
      } catch (error) {
        console.error('Error registering purchase:', error)
        alert('Erro ao registrar compra')
        return
      }
    } else {
      alert(`Mesa ${mesa.nome} finalizada! Pagamento: ${formaPagamento}`)
    }

    try {
      await fetch(`/api/mesas/${mesa.id}`, { method: 'DELETE' })
      await loadMesas()
    } catch (error) {
      console.error('Error finalizing mesa:', error)
    }
  }

  const handleCloseMesa = async (mesaId) => {
    if (!confirm('Deseja fechar esta mesa sem registrar?')) return
    
    try {
      await fetch(`/api/mesas/${mesaId}`, { method: 'DELETE' })
      await loadMesas()
    } catch (error) {
      console.error('Error closing mesa:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Mesas / Consumo Diário"
        logout={false}
        arrow={true}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg sm:text-xl font-semibold">Mesas Abertas ({mesas.length})</h2>
          <NewMesaDialog onCreate={handleCreateMesa} />
        </div>

        <MesaList 
          mesas={mesas} 
          produtos={produtos} 
          clientes={clientes} 
          onAddItem={handleAdicionarItem}
          onUpdateQuantidade={handleUpdateQuantidade}
          onRemoveItem={handleRemoverItem}
          onFinalize={handleFinalize}
          onAbate={handleAbater}
          onCloseMesa={handleCloseMesa}
        />
      </main>
    </div>
  )
}