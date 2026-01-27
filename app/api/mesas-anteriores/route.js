import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

const supabase = getServerSupabase()

export async function GET() {
  try {
    const dezDiasAtras = new Date()
    dezDiasAtras.setDate(dezDiasAtras.getDate() - 10)

    await supabase
      .from('mesas_historico')
      .delete()
      .lt('data_fechamento', dezDiasAtras.toISOString())

    const { data: historico, error } = await supabase
      .from('mesas_historico')
      .select('*')
      .order('data_fechamento', { ascending: false })

    if (error) {
      console.error('Erro Supabase GET:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ historico: historico || [] })
  } catch (error) {
    console.error('Erro Geral GET:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('mesas_historico')
      .insert([{
        nome_mesa: body.nome_mesa,
        data_abertura: body.data_abertura,
        itens: body.itens,
        total: body.total,
        forma_pagamento: body.forma_pagamento,
        foi_fiado: body.foi_fiado,
        cliente_nome: body.cliente_nome,
        logs: body.logs
      }])

    if (error) {
      console.error('Erro Supabase POST:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro Geral POST:', error)
    return NextResponse.json({ error: 'Erro interno ao salvar histórico' }, { status: 500 })
  }
}