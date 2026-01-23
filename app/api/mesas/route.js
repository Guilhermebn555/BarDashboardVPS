import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { mesaSchema } from '@/lib/validation'
import { sanitizeError } from '@/lib/api-utils'

const supabase = getServerSupabase()

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('mesas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ mesas: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const validationResult = mesaSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validData = validationResult.data

    const { data, error } = await supabase
      .from('mesas')
      .insert([{
        nome: validData.nome,
        itens: validData.itens || [],
        observacoes: validData.observacoes || null,
        logs: validData.logs || []
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ mesa: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}