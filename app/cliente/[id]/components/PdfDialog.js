'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateClientePDF } from '@/lib/pdf-generator'

export function PdfDialog({ cliente }) {
  const [open, setOpen] = useState(false)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const handleGenerate = async () => {
    if (!dataInicio || !dataFim) return alert('Selecione as datas')
    
    // Buscar transações apenas para o PDF para garantir dados frescos ou filtrados
    // Nota: Em uma refatoração ideal, a lista de transações viria do pai, mas aqui simplificamos
    const res = await fetch(`/api/clientes/${cliente.id}`)
    const data = await res.json()
    
    const dInicio = new Date(dataInicio.replace(/-/g, '/'))
    const dFim = new Date(dataFim.replace(/-/g, '/'))
    dFim.setHours(23, 59, 59, 999)

    const filtradas = data.transacoes.filter(t => {
      const dt = new Date(t.created_at)
      return dt >= dInicio && dt <= dFim
    })

    if (filtradas.length === 0) return alert('Nenhuma transação no período')

    const doc = generateClientePDF(cliente, filtradas, dInicio, dFim)
    doc.save(`extrato_${cliente.nome}.pdf`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-green-600 border-green-500 hover:bg-green-50">
          <FileDown className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Exportar PDF</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Inicio</Label><Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} /></div>
          <div><Label>Fim</Label><Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} /></div>
          <Button onClick={handleGenerate} className="w-full">Baixar PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}