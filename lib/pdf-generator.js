import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateClientePDF(cliente, transacoes, dataInicio, dataFim) {
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.text('Bar do Roldão', 105, 15, { align: 'center' })

  doc.setFontSize(16)
  doc.text('Extrato de Transações', 105, 25, { align: 'center' })

  doc.setFontSize(12)
  doc.text(`Cliente: ${cliente.nome}`, 20, 40)
  if (cliente.telefone) doc.text(`Telefone: ${cliente.telefone}`, 20, 47)
  if (cliente.email) doc.text(`Email: ${cliente.email}`, 20, 54)

  doc.text(
    `Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} até ${new Date(dataFim).toLocaleDateString('pt-BR')}`,
    20,
    61
  )

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)

  doc.setFontSize(14)
  doc.text(`Saldo Atual: ${formatCurrency(cliente.saldo)}`, 20, 70)

  const tableData = transacoes.map((t) => {
    const data = new Date(t.created_at).toLocaleDateString('pt-BR')
    const hora = new Date(t.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const tipo = t.tipo === 'compra' ? 'Compra' : 'Pagamento'
    const descricao = t.dados?.descricao || '-'
    const valor = t.tipo === 'compra' ? `-${formatCurrency(t.valor)}` : `+${formatCurrency(t.valor)}`
    const obs = t.observacoes || '-'
    return [data, hora, tipo, descricao, obs, valor]
  })

  autoTable(doc, {
    startY: 80,
    head: [['Data', 'Hora', 'Tipo', 'Descrição', 'Obs', 'Valor']],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: { 5: { halign: 'right', fontStyle: 'bold' } },
    didParseCell: function (data) {
      if (data.column.index === 5 && data.section === 'body') {
        if (data.cell.raw.startsWith('-')) {
          data.cell.styles.textColor = [231, 76, 60]
        } else {
          data.cell.styles.textColor = [39, 174, 96]
        }
      }
    }
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  return doc
}
