import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { clienteSchema } from '@/lib/validation'
import { calculateBalance, sanitizeError } from '@/lib/api-utils'

const supabase = getServerSupabase()

export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')

    if (error) throw error

    const clientesComSaldo = await Promise.all(
      data.map(async (cliente) => {
        const saldo = await calculateBalance(cliente.id)
        return { ...cliente, saldo }
      })
    )

    return NextResponse.json({ clientes: clientesComSaldo })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function POST(request) {
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