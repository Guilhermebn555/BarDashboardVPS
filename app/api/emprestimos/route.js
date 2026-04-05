import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { emprestimoSchema } from '@/lib/validation'
import { sanitizeError } from '@/lib/api-utils'

export async function GET(request) {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase
      .from('emprestimos') 
      .select('*')
      .order('data_iso', { ascending: false })

    if (error) throw error

    return NextResponse.json({ emprestimos: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = getServerSupabase()

  try {
    const body = await request.json()
    const validationResult = emprestimoSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }
    const validData = validationResult.data;

    const { data, error } = await supabase
      .from('emprestimos')
      .insert([{
        nome: validData.nome,
        itens: validData.itens,
        data_emprestimo: validData.data_emprestimo,
        hora: validData.hora,
        data_iso: validData.data_iso,
        devolvido: validData.devolvido ?? false
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ emprestimo: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}