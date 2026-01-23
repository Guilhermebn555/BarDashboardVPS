import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { compraPixSchema } from '@/lib/validation'
import { sanitizeError } from '@/lib/api-utils'

const supabase = getServerSupabase()

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('compras_pix')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ compras: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const validationResult = compraPixSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validData = validationResult.data

    const { data, error } = await supabase
      .from('compras_pix')
      .insert([{
        nome_cliente: validData.nome_cliente,
        itens: validData.itens,
        total: validData.total
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ compra: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}