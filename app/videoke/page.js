"use client";

import { useState, useEffect } from "react";
import { MicrophoneStage, PlayCircle, Trash, WarningCircle } from "@phosphor-icons/react";

export default function DashboardDJ() {
  const [fila, setFila] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscarFila = async () => {
    try {
      const res = await fetch('/api/fila');
      if (res.ok) {
        const data = await res.json();
        setFila(data.fila || []);
      }
    } catch (error) {
      console.error("Erro silencioso ao buscar fila:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarFila(); 
    
    const intervalo = setInterval(buscarFila, 2000);
    return () => clearInterval(intervalo);
  }, []);

  const handleTocar = async (pedido) => {
    setFila((filaAtual) => filaAtual.filter(p => p.id !== pedido.id));

    try {
      fetch('/api/tocar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: pedido.codigo, acao: 'tocar_direto' })
      });

      // 2. Manda a nossa API apagar do banco
      await fetch('/api/fila', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pedido.id })
      });
    } catch (erro) {
      console.error("Erro ao tocar:", erro);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que quer cancelar essa música?")) return;
    
    setFila((filaAtual) => filaAtual.filter(p => p.id !== id));
    
    await fetch('/api/fila', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  };

  // ==========================================
  // RENDERIZAÇÃO DA TELA
  // ==========================================
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 py-4 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-zinc-950">
            <MicrophoneStage size={24} weight="fill" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">Painel do DJ</h1>
            <p className="text-xs font-bold text-amber-500 tracking-widest">BAR DO ROLDÃO</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {fila.length} Pedidos
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        {loading ? (
          <div className="flex justify-center py-20 text-amber-500">
            <WarningCircle size={48} className="animate-pulse" />
          </div>
        ) : fila.length === 0 ? (
          <div className="mt-20 text-center text-zinc-500">
            <MicrophoneStage size={64} weight="duotone" className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold uppercase tracking-widest">A fila está vazia</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {fila.map((pedido, index) => (
              <div key={pedido.id} className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700">
                <div className="flex items-center gap-4">
                  <div className="w-6 text-center text-xs font-black text-zinc-600">#{index + 1}</div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800 text-cyan-400 font-mono text-lg font-bold shadow-inner">
                    {pedido.codigo}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100 text-lg leading-tight">{pedido.titulo}</h3>
                    <p className="text-amber-500/80 text-sm font-medium">{pedido.cantor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => handleExcluir(pedido.id)} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                    <Trash size={20} weight="duotone" />
                  </button>
                  <button onClick={() => handleTocar(pedido)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-zinc-950 font-black uppercase tracking-wider hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,165,36,0.3)]">
                    <PlayCircle size={22} weight="fill" /> Tocar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}