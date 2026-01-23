import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { transacaoSchema } from '@/lib/validation'
import { sanitizeError } from '@/lib/api-utils'

const supabase = getServerSupabase()

export async function POST(request) {
  try {
    const body = await request.json()
    const validationResult = transacaoSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validData = validationResult.data

    const { data, error } = await supabase
      .from('transacoes')
      .insert([{
        cliente_id: validData.cliente_id,
        tipo: validData.tipo,
        valor: validData.valor,
        dados: validData.dados || {},
        observacoes: validData.observacoes || null
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ transacao: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}