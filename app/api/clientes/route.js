import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { clienteSchema } from '@/lib/validation'
import { sanitizeError } from '@/lib/api-utils'

export async function GET(request) {
  const supabase = getServerSupabase()

  try {
    const { data, error } = await supabase
      .from('clientes_com_saldo') 
      .select('*')
      .order('nome')

    if (error) throw error

    return NextResponse.json({ clientes: data })

  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = getServerSupabase()

  try {
    const body = await request.json()
    const validationResult = clienteSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validData = validationResult.data

    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        nome: validData.nome,
        apelidos: validData.apelidos || [],
        telefone: validData.telefone || null,
        email: validData.email || null,
        foto_path: validData.foto_path || null,
        dia_pagamento: validData.dia_pagamento || null,
        limite_credito: validData.limite_credito || 0,
        tags: validData.tags || []
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ cliente: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}