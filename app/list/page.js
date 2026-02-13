'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  StickyNote, 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  CheckSquare, 
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ListaPage() {
  const [listas, setListas] = useState([])
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Estado do formulário
  const [editingId, setEditingId] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState('checklist') // 'checklist' ou 'texto'
  const [conteudoTexto, setConteudoTexto] = useState('')
  const [itemsChecklist, setItemsChecklist] = useState([])
  const [novoItem, setNovoItem] = useState('')

  // Carregar do LocalStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem('minhas-listas')
    if (saved) {
      setListas(JSON.parse(saved))
    }
  }, [])

  // Salvar no LocalStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('minhas-listas', JSON.stringify(listas))
  }, [listas])

  const handleSave = () => {
    if (!titulo.trim()) return

    const novaLista = {
      id: editingId || crypto.randomUUID(),
      titulo,
      tipo,
      conteudo: tipo === 'texto' ? conteudoTexto : itemsChecklist,
      updated_at: new Date().toISOString(),
      created_at: editingId ? listas.find(l => l.id === editingId).created_at : new Date().toISOString()
    }

    if (editingId) {
      setListas(listas.map(l => l.id === editingId ? novaLista : l))
    } else {
      setListas([novaLista, ...listas])
    }

    resetForm()
  }

  const handleEdit = (lista) => {
    setEditingId(lista.id)
    setTitulo(lista.titulo)
    setTipo(lista.tipo)
    if (lista.tipo === 'texto') {
      setConteudoTexto(lista.conteudo)
      setItemsChecklist([])
    } else {
      setItemsChecklist(lista.conteudo)
      setConteudoTexto('')
    }
    setIsDialogOpen(true)
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta lista?')) {
      setListas(listas.filter(l => l.id !== id))
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setTitulo('')
    setTipo('checklist')
    setConteudoTexto('')
    setItemsChecklist([])
    setNovoItem('')
    setIsDialogOpen(false)
  }

  const addItemChecklist = (e) => {
    e.preventDefault()
    if (!novoItem.trim()) return
    setItemsChecklist([...itemsChecklist, { text: novoItem, checked: false, id: crypto.randomUUID() }])
    setNovoItem('')
  }

  const toggleItemCheck = (itemId) => {
    setItemsChecklist(itemsChecklist.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ))
  }

  const removeItemChecklist = (itemId) => {
    setItemsChecklist(itemsChecklist.filter(item => item.id !== itemId))
  }

  // Filtragem
  const filteredListas = listas.filter(l => 
    l.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (typeof l.conteudo === 'string' && l.conteudo.toLowerCase().includes(search.toLowerCase()))
  )

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' }).format(new Date(dateString))
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <StickyNote className="w-6 h-6 text-emerald-500" />
              Minhas Listas
            </h1>
            <p className="text-sm text-slate-500">Gerencie suas compras e anotações</p>
          </div>

          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar listas..." 
                className="pl-9 bg-slate-100 dark:bg-slate-800 border-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
              <Plus className="w-4 h-4 mr-2" /> Nova
            </Button>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO --- */}
      <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {filteredListas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <StickyNote className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-medium">Nenhuma lista encontrada</p>
            <p className="text-sm">Crie uma nova lista para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListas.map((lista) => (
              <div 
                key={lista.id} 
                onClick={() => handleEdit(lista)}
                className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className={`
                      ${lista.tipo === 'checklist' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800'}
                    `}>
                      {lista.tipo === 'checklist' ? <ShoppingCart className="w-3 h-3 mr-1" /> : <StickyNote className="w-3 h-3 mr-1" />}
                      {lista.tipo === 'checklist' ? 'Lista' : 'Nota'}
                    </Badge>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-slate-400 hover:text-slate-600" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(lista) }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(lista.id) }}>
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Título */}
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 line-clamp-1">
                  {lista.titulo}
                </h3>

                {/* Preview do Conteúdo */}
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-8 h-20 overflow-hidden relative">
                  {lista.tipo === 'texto' ? (
                    <p className="whitespace-pre-wrap line-clamp-4">{lista.conteudo}</p>
                  ) : (
                    <ul className="space-y-1">
                      {lista.conteudo.slice(0, 4).map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.checked ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                          <span className={item.checked ? 'line-through opacity-60' : ''}>{item.text}</span>
                        </li>
                      ))}
                      {lista.conteudo.length > 4 && <li className="text-xs italic opacity-70">e mais {lista.conteudo.length - 4} itens...</li>}
                    </ul>
                  )}
                  {/* Gradiente para suavizar o corte */}
                  <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />
                </div>

                {/* Footer do Card */}
                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {formatDate(lista.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- DIALOG DE CRIAÇÃO/EDIÇÃO --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-950 max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Lista' : 'Nova Lista / Anotação'}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            
            {/* Título e Tipo */}
            <div className="space-y-4">
              <Input 
                placeholder="Título (Ex: Lista de Compras dia 19/05)" 
                value={titulo} 
                onChange={e => setTitulo(e.target.value)}
                className="text-lg font-bold border-slate-200 dark:border-slate-800"
              />
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={tipo === 'checklist' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTipo('checklist')}
                  className={tipo === 'checklist' ? 'bg-slate-900 text-white' : ''}
                >
                  <CheckSquare className="w-4 h-4 mr-2" /> Checklist
                </Button>
                <Button 
                  type="button" 
                  variant={tipo === 'texto' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTipo('texto')}
                  className={tipo === 'texto' ? 'bg-slate-900 text-white' : ''}
                >
                  <StickyNote className="w-4 h-4 mr-2" /> Texto Livre
                </Button>
              </div>
            </div>

            {/* Área de Conteúdo */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 min-h-[300px]">
              
              {tipo === 'texto' ? (
                <Textarea 
                  placeholder="Escreva suas anotações aqui..." 
                  className="w-full h-full min-h-[300px] bg-transparent border-0 resize-none focus-visible:ring-0 p-0 text-base"
                  value={conteudoTexto}
                  onChange={e => setConteudoTexto(e.target.value)}
                />
              ) : (
                <div className="space-y-4">
                  <form onSubmit={addItemChecklist} className="flex gap-2">
                    <Input 
                      placeholder="Adicionar item..." 
                      value={novoItem}
                      onChange={e => setNovoItem(e.target.value)}
                      className="bg-white dark:bg-slate-800"
                    />
                    <Button type="submit" size="icon" variant="secondary">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </form>

                  <div className="space-y-2">
                    {itemsChecklist.length === 0 && (
                      <div className="text-center text-slate-400 py-10 text-sm">
                        Nenhum item adicionado ainda
                      </div>
                    )}
                    {itemsChecklist.map((item) => (
                      <div key={item.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors">
                         <div 
                          onClick={() => toggleItemCheck(item.id)}
                          className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${
                            item.checked 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                         >
                           {item.checked && <CheckSquare className="w-3.5 h-3.5" />}
                         </div>
                         
                         <span className={`flex-1 text-sm ${item.checked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                           {item.text}
                         </span>

                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                           onClick={() => removeItemChecklist(item.id)}
                         >
                           <X className="w-3 h-3" />
                         </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              Salvar Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}