import { getServerSupabase } from '@/lib/supabase'

export async function calculateBalance(clienteId) {
  const supabase = getServerSupabase()
  const { data: transacoes, error } = await supabase
    .from('transacoes')
    .select('tipo, valor')
    .eq('cliente_id', clienteId)

  if (error) {
    console.error('Error fetching transactions:', error)
    return 0
  }

  let totalAbates = 0
  let totalCompras = 0

  transacoes.forEach(t => {
    if (t.tipo === 'abate') {
      totalAbates += parseFloat(t.valor)
    } else if (t.tipo === 'compra') {
      totalCompras += parseFloat(t.valor)
    }
  })

  return totalAbates - totalCompras
}

export function sanitizeError(error) {
  if (process.env.NODE_ENV === 'production') {
    console.error('API Error:', error)
    return 'Erro ao processar requisição'
  }
  return error.message
}