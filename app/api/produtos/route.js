import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { produtoSchema } from '@/lib/validation'
import { sanitizeError } from '@/lib/api-utils'

const supabase = getServerSupabase()

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome')

    if (error) throw error

    return NextResponse.json({ produtos: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const validationResult = produtoSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validData = validationResult.data

    const { data, error } = await supabase
      .from('produtos')
      .insert([{
        nome: validData.nome,
        preco: validData.preco,
        categoria: validData.categoria || null,
        ativo: validData.ativo !== false,
        valor_taxa: validData.valor_taxa || 0
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ produto: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}