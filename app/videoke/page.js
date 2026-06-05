'use client'

import { useState, useEffect, useRef } from 'react'
import { VideokeHeader } from './components/VideokeHeader'
import { FilaList } from './components/FilaList'
import { tocarPlin, registrarDesbloqueioAudio } from '@/lib/videoke-sound'
import { supabaseVideoke } from '@/lib/videoke-supabase'

export default function DashboardDJ() {
  const [fila, setFila] = useState([])
  const [loading, setLoading] = useState(true)
  const [codigoNoite, setCodigoNoite] = useState(null)
  const [somAtivo, setSomAtivo] = useState(true)

  const idsConhecidosRef = useRef(new Set())
  const somAtivoRef = useRef(true)

  useEffect(() => { somAtivoRef.current = somAtivo }, [somAtivo])

  const buscarConfiguracao = async () => {
    try {
      const res = await fetch('/api/configuracoes', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setCodigoNoite(data?.configuracao?.pin_atual ?? '')
      } else {
        setCodigoNoite('')
      }
    } catch (error) {
      console.error('Erro ao buscar configuração:', error)
      setCodigoNoite('')
    }
  }

  const buscarFila = async () => {
    try {
      const res = await fetch('/api/fila')
      if (res.ok) {
        const data = await res.json()
        const novaFila = data.fila || []
        idsConhecidosRef.current = new Set(novaFila.map(p => p.id))
        setFila(novaFila)
      }
    } catch (error) {
      console.error('Erro ao buscar fila:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    registrarDesbloqueioAudio()
    buscarConfiguracao()
    buscarFila()

    const canal = supabaseVideoke
      .channel('fila_pedidos_dj')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fila_pedidos' },
        (payload) => {
          const novo = payload.new
          if (!novo || idsConhecidosRef.current.has(novo.id)) return
          idsConhecidosRef.current.add(novo.id)
          if (somAtivoRef.current) tocarPlin()
          setFila((atual) => {
            if (atual.some(p => p.id === novo.id)) return atual
            return [...atual, novo].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'fila_pedidos' },
        (payload) => {
          const idRemovido = payload.old?.id
          if (!idRemovido) return
          idsConhecidosRef.current.delete(idRemovido)
          setFila((atual) => atual.filter(p => p.id !== idRemovido))
        }
      )
      .subscribe()

    return () => {
      supabaseVideoke.removeChannel(canal)
    }
  }, [])

  const handleTocar = async (pedido) => {
    setFila((filaAtual) => filaAtual.filter(p => p.id !== pedido.id))
    idsConhecidosRef.current.delete(pedido.id)

    try {
      fetch('/api/tocar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: pedido.codigo, acao: 'tocar_direto' })
      })

      await fetch('/api/fila', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pedido.id })
      })
    } catch (error) {
      console.error('Erro ao tocar:', error)
    }
  }

  const handleExcluir = async (id) => {
    setFila((filaAtual) => filaAtual.filter(p => p.id !== id))
    idsConhecidosRef.current.delete(id)

    try {
      await fetch('/api/fila', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <VideokeHeader
        totalPedidos={fila.length}
        codigoNoite={codigoNoite}
        onUpdateCodigo={setCodigoNoite}
        somAtivo={somAtivo}
        onToggleSom={() => setSomAtivo(s => !s)}
      />

      <main className="mx-auto max-w-3xl p-6">
        <FilaList
          fila={fila}
          loading={loading}
          onTocar={handleTocar}
          onExcluir={handleExcluir}
        />
      </main>
    </div>
  )
}