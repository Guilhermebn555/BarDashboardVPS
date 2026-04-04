"use client";

import { useState, useEffect } from 'react';

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [produtos, setProdutos] = useState([]); // Agora é um array de objetos: { id, nome }
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [showRecebidos, setShowRecebidos] = useState(false);
  const [showAtrasados, setShowAtrasados] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [isModalEmprestimoOpen, setIsModalEmprestimoOpen] = useState(false);
  const [isModalProdutoOpen, setIsModalProdutoOpen] = useState(false);

  // Formulários
  const [nome, setNome] = useState('');
  const [tipoItem, setTipoItem] = useState(''); 
  const [quantidade, setQuantidade] = useState(1);
  const [novoProdutoNome, setNovoProdutoNome] = useState('');

  // 1. Carregar os dados do Backend (Supabase via API)
  const fetchDados = async () => {
    setIsLoading(true);
    try {
      const [resEmp, resProd] = await Promise.all([
        fetch('/api/emprestimos'),
        fetch('/api/produtos-emprestimo')
      ]);
      
      const jsonEmp = await resEmp.json();
      const jsonProd = await resProd.json();

      if (jsonEmp.emprestimos) setEmprestimos(jsonEmp.emprestimos);
      if (jsonProd.produtos) {
          setProdutos(jsonProd.produtos);
          if (jsonProd.produtos.length > 0 && !tipoItem) {
              setTipoItem(jsonProd.produtos[0].nome);
          }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);


  // --- FUNÇÕES DE INTEGRAÇÃO API ---

  const handleRegistrarEmprestimo = async (e) => {
    e.preventDefault();
    if (!nome || !quantidade || !tipoItem) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    const dataAtual = new Date();
    const payload = {
      nome: nome,
      item_nome: tipoItem,
      quantidade: parseInt(quantidade),
      data_emprestimo: dataAtual.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
      hora: dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      data_iso: dataAtual.toISOString(),
    };

    try {
        const res = await fetch('/api/emprestimos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        
        if (json.emprestimo) {
            setEmprestimos([json.emprestimo, ...emprestimos]);
            setNome('');
            setQuantidade(1);
            setIsModalEmprestimoOpen(false);
        } else {
            alert("Erro ao registrar: " + JSON.stringify(json.error));
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleCadastrarProduto = async (e) => {
    e.preventDefault();
    if (!novoProdutoNome) return;

    try {
        const res = await fetch('/api/produtos-emprestimo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novoProdutoNome })
        });
        const json = await res.json();

        if (json.produto) {
            setProdutos([...produtos, json.produto]);
            setTipoItem(json.produto.nome);
            setNovoProdutoNome('');
            setIsModalProdutoOpen(false);
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleRemoverProduto = async (idProduto, nomeProduto) => {
      if(confirm(`Remover "${nomeProduto}" das opções?`)) {
          try {
              await fetch(`/api/produtos-emprestimo?id=${idProduto}`, { method: 'DELETE' });
              setProdutos(produtos.filter(p => p.id !== idProduto));
          } catch (error) {
              console.error(error);
          }
      }
  };

  const handleDevolucao = async (id) => {
    try {
        const res = await fetch(`/api/emprestimos/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ devolvido: true })
        });
        const json = await res.json();

        if(json.emprestimo) {
            setEmprestimos(emprestimos.map((item) => item.id === id ? { ...item, devolvido: true } : item));
        }
    } catch (error) {
        console.error(error);
    }
  };

  const handleExcluir = async (id) => {
    if(confirm("Tem certeza que deseja apagar este registro definitivamente?")) {
        try {
            await fetch(`/api/emprestimos/${id}`, { method: 'DELETE' });
            setEmprestimos(emprestimos.filter((item) => item.id !== id));
        } catch (error) {
            console.error(error);
        }
    }
  };

  // --- LÓGICA DE FILTRAGEM E AGRUPAMENTO ---
  const hoje = new Date();
  const emprestimosFiltrados = emprestimos.filter(item => {
    if (searchTerm && !item.nome.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    if (showAtrasados) {
        if (item.devolvido) return false;
        const dataDoEmprestimo = new Date(item.data_iso);
        const diferencaEmDias = (hoje - dataDoEmprestimo) / (1000 * 60 * 60 * 24);
        if (diferencaEmDias <= 30) return false;
    } else {
        if (!showRecebidos && item.devolvido) return false;
    }
    return true;
  });

  const emprestimosAgrupados = emprestimosFiltrados.reduce((acc, item) => {
    if (!acc[item.data_emprestimo]) acc[item.data_emprestimo] = [];
    acc[item.data_emprestimo].push(item);
    return acc;
  }, {});

  if (isLoading) {
      return <div className="min-h-screen bg-[#0B1121] flex items-center justify-center text-white">Carregando dados...</div>
  }

  return (
    <div className="min-h-screen bg-[#0B1121] text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-6">
          <h1 className="text-2xl font-bold text-white">Empréstimos</h1>
          <div className="flex w-full md:w-auto gap-3">
             <button
              onClick={() => setIsModalProdutoOpen(true)}
              className="flex-1 md:flex-none bg-[#1F2937] border border-gray-700 hover:bg-gray-800 text-white px-4 py-2.5 rounded-md font-medium transition"
            >
              ⚙️ Produtos
            </button>
            <button
              onClick={() => setIsModalEmprestimoOpen(true)}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition shadow-lg"
            >
              + Novo Empréstimo
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-[#111827] border border-gray-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">🔍</span>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente pelo nome..."
                className="w-full bg-[#0B1121] border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex gap-4 w-full md:w-auto text-sm font-medium">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition">
                <input 
                    type="checkbox" 
                    checked={showRecebidos} 
                    onChange={(e) => setShowRecebidos(e.target.checked)}
                    disabled={showAtrasados}
                    className="rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-gray-900 w-4 h-4 cursor-pointer disabled:opacity-50"
                />
                Mostrar Recebidos
            </label>
            
            <button 
                onClick={() => {
                    setShowAtrasados(!showAtrasados);
                    if(!showAtrasados) setShowRecebidos(false);
                }}
                className={`px-3 py-1.5 rounded border transition ${
                    showAtrasados 
                    ? 'bg-red-900/40 border-red-500 text-red-400' 
                    : 'bg-transparent border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-900'
                }`}
            >
                ⚠️ +30 Dias Atraso
            </button>
          </div>
        </div>

        {/* LISTA DE EMPRÉSTIMOS */}
        <div className="space-y-10">
          {Object.keys(emprestimosAgrupados).length === 0 ? (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-lg">
              Nenhum registro encontrado.
            </div>
          ) : (
            Object.keys(emprestimosAgrupados).map((data) => (
              <div key={data} className="space-y-4">
                <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-2">{data}</h2>
                <div className="space-y-3">
                  {emprestimosAgrupados[data].map((item) => {
                     const diasAtraso = Math.floor((hoje - new Date(item.data_iso)) / (1000 * 60 * 60 * 24));
                     const isAtrasado = diasAtraso > 30 && !item.devolvido;

                     return (
                        <div 
                        key={item.id} 
                        className={`bg-[#111827] border rounded-lg p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 transition
                            ${item.devolvido ? 'border-green-900/50 opacity-50' : isAtrasado ? 'border-red-900/80 shadow-[0_0_10px_rgba(220,38,38,0.15)]' : 'border-gray-800'} 
                        `}
                        >
                        <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                            <span className={`font-bold ${item.devolvido ? 'text-gray-500' : isAtrasado ? 'text-red-400' : 'text-blue-400'}`}>
                                {item.hora}
                            </span>
                            <span className={`font-medium ${item.devolvido ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                                - {item.nome}
                            </span>
                            
                            {item.devolvido && (
                                <span className="bg-green-900/40 text-green-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-green-800/50">
                                Devolvido
                                </span>
                            )}
                            {isAtrasado && (
                                <span className="bg-red-900/40 text-red-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-red-800/50 animate-pulse">
                                {diasAtraso} dias atrasado
                                </span>
                            )}
                            </div>
                            <div className="text-sm text-gray-400">
                            <span className="text-blue-500 font-bold">{item.quantidade}x </span> 
                            <span>{item.item_nome}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!item.devolvido && (
                            <button
                                onClick={() => handleDevolucao(item.id)}
                                className="flex items-center gap-1 bg-transparent border border-gray-700 hover:border-green-500 hover:text-green-500 text-gray-300 px-3 py-1.5 rounded text-sm transition"
                            >
                                ✓ Receber
                            </button>
                            )}
                            <button
                            onClick={() => handleExcluir(item.id)}
                            className="flex items-center justify-center bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 text-red-500 w-8 h-8 rounded transition"
                            >
                            🗑
                            </button>
                        </div>
                        </div>
                     )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL 1: REGISTRAR */}
      {isModalEmprestimoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1F2937] w-full max-w-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Registrar Saída</h2>
                <button onClick={() => setIsModalEmprestimoOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
              </div>

              <form onSubmit={handleRegistrarEmprestimo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-[#111827] border border-gray-600 rounded-md p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Roldão Cliente"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Item</label>
                    <select
                      value={tipoItem}
                      onChange={(e) => setTipoItem(e.target.value)}
                      className="w-full bg-[#111827] border border-gray-600 rounded-md p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      {produtos.map((prod) => (
                          <option key={prod.id} value={prod.nome}>{prod.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Qtd</label>
                    <input
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                      className="w-full bg-[#111827] border border-gray-600 rounded-md p-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-center"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalEmprestimoOpen(false)} className="flex-1 bg-transparent border border-gray-600 text-gray-300 py-2.5 rounded-md hover:bg-gray-800 transition">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition font-medium">
                    Salvar Empréstimo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRODUTOS */}
      {isModalProdutoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1F2937] w-full max-w-sm rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Gerenciar Produtos</h2>
                <button onClick={() => setIsModalProdutoOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
              </div>

              <form onSubmit={handleCadastrarProduto} className="flex gap-2">
                 <input
                    type="text"
                    value={novoProdutoNome}
                    onChange={(e) => setNovoProdutoNome(e.target.value)}
                    placeholder="Ex: Cadeira Crystal"
                    className="flex-1 bg-[#111827] border border-gray-600 rounded-md p-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium text-sm transition">
                    Adicionar
                  </button>
              </form>

              <div className="bg-[#111827] border border-gray-700 rounded-md p-3 max-h-48 overflow-y-auto">
                 <p className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Itens Disponíveis</p>
                 <ul className="space-y-2">
                    {produtos.map((prod) => (
                        <li key={prod.id} className="flex justify-between items-center text-sm text-gray-300 border-b border-gray-800 pb-1 last:border-0">
                            <span>{prod.nome}</span>
                            <button onClick={() => handleRemoverProduto(prod.id, prod.nome)} className="text-red-500 hover:text-red-400 font-bold ml-2">
                                &times;
                            </button>
                        </li>
                    ))}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}