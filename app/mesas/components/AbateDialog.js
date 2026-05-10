'use client'

import { useState, useEffect } from 'react'
import { Ban, Banknote, CreditCard, QrCode, ArrowDown, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/formatters'

export function AbateDialog({ mesa, total, onAbate }) {
  const [open, setOpen] = useState(false)
  const [valorAbater, setValorAbater] = useState('')
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setValorAbater('')
      setMetodoPagamento('dinheiro')
    }
  }, [open])

  const handleConfirm = () => {
    setLoading(true)
    onAbate(mesa, {
      valorAbater,
      metodoPagamentoAbater: metodoPagamento,
      total
    })
    setLoading(false)
    setOpen(false)
  }

  const valorNum = parseFloat(valorAbater) || 0
  const novoSaldo = total - valorNum
  const isValorValido = valorNum > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-12 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-600 dark:text-orange-400">
          <Ban className="mr-2 w-4 h-4" /> Abater
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0 bg-slate-50 dark:bg-slate-950 border-none shadow-2xl">
        
        <div className="bg-orange-500 text-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <div className="bg-white/20 p-2 rounded-lg">
                <Ban className="w-6 h-6 text-white" />
              </div>
              Abater da Conta de {mesa.nome}
            </DialogTitle>
            <p className="text-orange-100 text-sm mt-1 opacity-90">
              Registre pagamentos parciais ou adiantamentos.
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 p-4 sm:p-6">
          
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Devedor</p>
                <p className="text-2xl font-black text-slate-700 dark:text-slate-200">
                    {formatCurrency(total)}
                </p>
             </div>
             <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                <Wallet className="w-6 h-6 text-slate-400" />
             </div>
          </div>

          <div className="space-y-3">
             <Label className="text-xs font-bold text-slate-500 uppercase">Valor a Abater</Label>
             <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold text-xl">R$</span>
                <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={valorAbater}
                    onChange={(e) => setValorAbater(e.target.value)}
                    className="h-14 sm:h-16 pl-10 sm:pl-12 text-2xl sm:text-3xl font-black bg-white dark:bg-slate-900 border-2 border-slate-200 focus-visible:border-orange-500 focus-visible:ring-0 transition-all rounded-xl"
                />
             </div>
          </div>

          <div className="space-y-3">
             <Label className="text-xs font-bold text-slate-500 uppercase">Forma de Pagamento</Label>
             <div className="grid grid-cols-3 gap-3">
                <MethodButton 
                    active={metodoPagamento === 'dinheiro'} 
                    onClick={() => setMetodoPagamento('dinheiro')}
                    icon={Banknote}
                    label="Dinheiro"
                />
                <MethodButton 
                    active={metodoPagamento === 'pix'} 
                    onClick={() => setMetodoPagamento('pix')}
                    icon={QrCode}
                    label="PIX"
                />
                <MethodButton 
                    active={metodoPagamento === 'cartao'} 
                    onClick={() => setMetodoPagamento('cartao')}
                    icon={CreditCard}
                    label="Cartão"
                />
             </div>
          </div>

          {valorNum > 0 && (
             <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-xl border border-orange-100 dark:border-orange-900/30 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Saldo Restante:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(novoSaldo)}</span>
                </div>
                {novoSaldo < 0 && (
                    <p className="text-xs text-red-500 font-bold mt-1 text-right">Atenção: Valor excede a conta!</p>
                )}
             </div>
          )}

          <Separator />

          <Button
            onClick={handleConfirm}
            className="w-full h-14 text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20 active:scale-95 transition-all"
            disabled={!isValorValido || loading}
          >
            {loading ? (
              <Loader2 className="ml-2 w-5 h-5 animate-spin" />
            ) : (
              <ArrowDown className="ml-2 w-5 h-5" />
            )}
            Confirmar Abatimento
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  )
}

function MethodButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 ${
        active 
        ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' 
        : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200 hover:bg-orange-50/50 dark:bg-slate-900 dark:border-slate-800'
      }`}
    >
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${active ? 'fill-current' : ''}`} />
      <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">{label}</span>
    </button>
  )
}