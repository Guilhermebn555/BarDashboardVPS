// 'use client'

// import { Trash2, Printer } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import handlePrintPDF from '@/lib/pdf-mesas'

// export function Options({ 
//   mesa,
// }) {
//   const calcularTotal = (itens) => {
//     return itens.reduce((total, item) => {
//       const valorItem = item.isKg ? parseFloat(item.preco) : (parseFloat(item.preco) * parseInt(item.quantidade));
//       return total + valorItem;
//     }, 0)
//   }

//   const onCloseMesa = async (mesaId) => {
//     if (!confirm('Deseja fechar esta mesa sem registrar?')) return
    
//     try {
//       await fetch(`/api/mesas/${mesaId}`, { method: 'DELETE' })
//       await loadMesas()
//     } catch (error) {
//       console.error('Error closing mesa:', error)
//     }
//   }

//   const total = calcularTotal(mesa.itens)

//   const printPDF = () => handlePrintPDF(mesa, total)

//   return (
//     <div className="flex gap-1">
//         <Button
//             variant="ghost"
//             size="icon"
//             onClick={printPDF}
//             title="Imprimir Cupom"
//         >
//             <Printer className="w-4 h-4 text-gray-600 dark:text-gray-400" />
//         </Button>
            
//         <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => onCloseMesa(mesa.id)}
//         >
//             <Trash2 className="w-4 h-4 text-red-600" />
//         </Button>
//     </div>
//   )
// }

'use client'

import { Trash2, Printer, EllipsisVertical, Expand } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import handlePrintPDF from '@/lib/pdf-mesas'
import { MesaDialog } from './MesaDialog'
import { useState } from 'react'

export function Options({ 
  mesa,
  loadMesas
}) {
  const calcularTotal = (itens) => {
    return itens.reduce((total, item) => {
      const valorItem = item.isKg ? parseFloat(item.preco) : (parseFloat(item.preco) * parseInt(item.quantidade));
      return total + valorItem;
    }, 0)
  }
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onCloseMesa = async (mesaId) => {
    if (!confirm('Deseja fechar esta mesa sem registrar?')) return
    
    try {
      await fetch(`/api/mesas/${mesaId}`, { method: 'DELETE' })
      await loadMesas()
    } catch (error) {
      console.error('Error closing mesa:', error)
    }
  }

  const total = calcularTotal(mesa.itens)

  const printPDF = () => handlePrintPDF(mesa, total)

  return (
    <DropdownMenu>
        <DropdownMenuTrigger className="bg-card text-white rounded outline-none hover:bg-blue-700 duration-200">
            <Button variant="soft">
                <EllipsisVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={printPDF}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCloseMesa(mesa.id)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Mesa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {setIsDialogOpen(true);}}>
                <Expand className="w-4 h-4 mr-2" />
                Mesa em Tela Cheia
            </DropdownMenuItem>
        </DropdownMenuContent>
        <MesaDialog mesa={mesa} isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </DropdownMenu>
    )
}