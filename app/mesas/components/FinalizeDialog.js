'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  Wallet, 
  User, 
  CreditCard, 
  Banknote, 
  QrCode, 
  NotebookPen,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export function FinalizeDialog({ mesa, clientes, total, onFinalize }) {
  const [open, setOpen] = useState(false)
  const [tipoPagamento, setTipoPagamento] = useState('vista')
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [observacoesCompra, setObservacoesCompra] = useState('')

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  useEffect(() => {
    if(!open) {
        setTipoPagamento('vista')
        setClienteSelecionado('')
        setFormaPagamento('dinheiro')
        setObservacoesCompra('')
    }
  }, [open])

  const handleConfirm = () => {
    onFinalize(mesa, {
      tipoPagamento,
      clienteSelecionado,
      formaPagamento,
      observacoesCompra,
      total
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            className="w-full h-13 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
            disabled={mesa.itens.length === 0}
        >
          <CheckCircle2 className="mr-3 w-6 h-6" /> Finalizar Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-full max-h-[95vh] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-none shadow-2xl flex flex-col">
        
        <div className={`p-6 shrink-0 transition-colors duration-300 ${
            tipoPagamento === 'vista' ? 'bg-emerald-600' : 'bg-amber-500'
        }`}>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-white">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        {tipoPagamento === 'vista' ? <Wallet className="w-6 h-6" /> : <NotebookPen className="w-6 h-6" />}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xl font-bold">Finalizar Conta de {mesa.nome}</span>
                        <span className="text-sm font-normal opacity-90 text-white">
                            {tipoPagamento === 'vista' ? 'Recebimento imediato' : 'Registrar na conta do cliente'}
                        </span>
                    </div>
                </DialogTitle>
            </DialogHeader>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">

            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total a Receber</span>
                <span className={`text-5xl font-black tracking-tighter ${
                    tipoPagamento === 'vista' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'
                }`}>
                    {formatCurrency(total)}
                </span>
                {total === 0 && (
                    <Badge variant="outline" className="mt-2 text-slate-500 border-slate-300">
                        Conta Zerada
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <SelectionCard 
                    active={tipoPagamento === 'vista'}
                    onClick={() => setTipoPagamento('vista')}
                    icon={Wallet}
                    title="À Vista"
                    description="Dinheiro, PIX ou Cartão"
                    color="emerald"
                />
                <SelectionCard 
                    active={tipoPagamento === 'fiado'}
                    onClick={() => setTipoPagamento('fiado')}
                    icon={NotebookPen}
                    title="Fiado"
                    description="Lançar na Caderneta"
                    color="amber"
                />
            </div>

            <div className="space-y-4 min-h-[120px] animate-in slide-in-from-bottom-2 fade-in duration-300">
                
                {tipoPagamento === 'vista' && (
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Como o cliente pagou?</Label>
                        <div className="grid grid-cols-3 gap-3">
                            <PaymentMethodButton 
                                active={formaPagamento === 'dinheiro'}
                                onClick={() => setFormaPagamento('dinheiro')}
                                icon={Banknote}
                                label="Dinheiro"
                            />
                            <PaymentMethodButton 
                                active={formaPagamento === 'pix'}
                                onClick={() => setFormaPagamento('pix')}
                                icon={QrCode}
                                label="PIX"
                            />
                            <PaymentMethodButton 
                                active={formaPagamento === 'cartao'}
                                onClick={() => setFormaPagamento('cartao')}
                                icon={CreditCard}
                                label="Cartão"
                            />
                        </div>
                    </div>
                )}

                {tipoPagamento === 'fiado' && (
                    <div className="space-y-4 pb-2"> {/* Adicionado pb-2 para espaço extra no scroll */}
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3 rounded-lg flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                O valor será adicionado ao saldo devedor do cliente selecionado.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-500 uppercase">Selecione o Cliente</Label>
                            <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                                <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-slate-200">
                                    <SelectValue placeholder="Buscar cliente..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map((cliente) => (
                                        <SelectItem key={cliente.id} value={cliente.id}>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <span className="font-medium">{cliente.nome}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                             <Label className="text-xs font-bold text-slate-500 uppercase">Observações (Opcional)</Label>
                             <Textarea
                                value={observacoesCompra}
                                onChange={(e) => setObservacoesCompra(e.target.value)}
                                placeholder="Ex: Cliente levou um vasilhame de coca..."
                                className="bg-white dark:bg-slate-900 min-h-[80px]"
                             />
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="p-6 pt-2 bg-slate-50 dark:bg-slate-950 shrink-0">
            <Button
                onClick={handleConfirm}
                className={`w-full h-14 text-lg font-bold text-white shadow-lg transition-all active:scale-95 ${
                    tipoPagamento === 'vista' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20' 
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'
                }`}
                disabled={(tipoPagamento === 'fiado' && !clienteSelecionado) || (total === 0 && mesa.itens.length === 0)}
            >
                {tipoPagamento === 'vista' ? (
                    <> <CheckCircle2 className="mr-2 w-6 h-6" /> Confirmar Recebimento </>
                ) : (
                    <> <NotebookPen className="mr-2 w-6 h-6" /> Registrar na Caderneta </>
                )}
            </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}

function SelectionCard({ active, onClick, icon: Icon, title, description, color }) {
    const activeClass = color === 'emerald' 
        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
        : 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';

    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] ${
                active 
                ? activeClass 
                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800'
            }`}
        >
            <div className={`p-2 rounded-lg mb-3 ${active ? 'bg-white/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg leading-none mb-1">{title}</span>
            <span className="text-xs opacity-80 font-medium">{description}</span>
        </button>
    )
}

function PaymentMethodButton({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                active 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800'
            }`}
        >
            <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} />
            <span className="text-xs font-bold">{label}</span>
        </button>
    )
}