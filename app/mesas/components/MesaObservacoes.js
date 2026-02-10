'use client'

import { useState, useEffect, useRef } from 'react'
import { StickyNote, Pencil, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils' // Se não tiver, remova e use string template normal

export function MesaObservacoes({ observacoesIniciais, onSave }) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(observacoesIniciais || '')
  const textareaRef = useRef(null)

  // Atualiza estado local se a prop mudar externamente
  useEffect(() => {
    setText(observacoesIniciais || '')
  }, [observacoesIniciais])

  // Foca no textarea quando entra em modo de edição
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      // Coloca o cursor no final
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    // Só salva se o texto mudou
    if (text !== observacoesIniciais) {
      onSave(text)
    }
  }

  // Se não tem observação e não está editando, mostra botão discreto
  if (!text && !isEditing) {
    return (
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-dashed border-slate-200 dark:border-slate-800 flex justify-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 gap-2 h-8"
        >
          <StickyNote className="w-3 h-3" />
          Adicionar Observação
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative px-4 py-3 transition-colors duration-300 border-b",
      isEditing ? "bg-white dark:bg-slate-950" : "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30"
    )}>
      {isEditing ? (
        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Editando observação...</span>
                <span className="text-[10px] uppercase tracking-wider">Clique fora para salvar</span>
            </div>
            <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleBlur}
                placeholder="Ex: Metade da Conta, foi paga por outro cliente, etc..."
                className="min-h-[80px] bg-transparent resize-none border-slate-200 focus-visible:ring-amber-500 focus:outline-none focus-visible:border-amber-500 rounded-md shadow-sm w-full"
            />
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="group cursor-pointer flex gap-3 items-start select-none"
        >
          <div className="mt-0.5 p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-md shrink-0 text-amber-600 dark:text-amber-400">
            <StickyNote className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
             <p className="text-sm text-amber-900 dark:text-amber-100 font-medium leading-relaxed whitespace-pre-wrap break-words">
               {text}
             </p>
             <p className="text-[10px] text-amber-700/60 dark:text-amber-400/50 mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Clique para editar
             </p>
          </div>

          <Button
             variant="ghost"
             size="icon"
             className="h-6 w-6 text-amber-400 hover:text-red-500 hover:bg-amber-100 dark:hover:bg-amber-900/50 -mr-1"
             onClick={(e) => {
                 e.stopPropagation()
                 setText('')
                 onSave('')
             }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}