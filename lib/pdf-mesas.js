import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const handlePrintPDF = (mesa, total) => {
    const doc = new jsPDF()

    const colorPrimary = [41, 37, 36] // Um cinza escuro/preto suave
    const colorSecondary = [245, 245, 245] // Cinza claro para fundo
    const colorAccent = [22, 163, 74] // Verde para total positivo
    
    doc.setFillColor(...colorPrimary)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(mesa.nome.toUpperCase(), 14, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const dataAtual = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', month: 'long', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    })
    doc.text(`Gerado em: ${dataAtual}`, 14, 30)

    const tableBody = mesa.itens.map(item => [
      item.nome,
      formatCurrency(item.preco),
      item.quantidade,
      formatCurrency(item.preco * item.quantidade)
    ])

    autoTable(doc, {
      startY: 50,
      head: [['PRODUTO / ITEM', 'PREÇO UNIT.', 'QTD', 'TOTAL']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: colorPrimary,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        lineColor: [220, 220, 220]
      },
      alternateRowStyles: {
        fillColor: colorSecondary
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 3) {
           const rawVal = data.cell.raw.replace('R$', '').trim().replace('.', '').replace(',', '.')
           if (parseFloat(rawVal) < 0) {
             data.cell.styles.textColor = [220, 38, 38]
           }
        }
      }
    })

    const finalY = doc.lastAutoTable.finalY + 10
    
    if (mesa.observacoes) {
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text('Observações:', 14, finalY)
      doc.setFontSize(9)
      doc.setTextColor(0)
      const splitObs = doc.splitTextToSize(mesa.observacoes, 100)
      doc.text(splitObs, 14, finalY + 6)
    }

    const rightMargin = 196
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colorPrimary)
    
    doc.text(`TOTAL FINAL: ${formatCurrency(total)}`, rightMargin, finalY + 5, { align: 'right' })
    
    doc.setDrawColor(...colorPrimary)
    doc.setLineWidth(0.5)
    doc.line(120, finalY + 8, 196, finalY + 8)

    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Documento para conferência interna.', 105, 290, { align: 'center' })

    doc.save(`extrato-${mesa.nome.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

export default handlePrintPDF;