import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { clienteSchema, uuidSchema } from '@/lib/validation'
import { calculateBalance, sanitizeError } from '@/lib/api-utils'

const supabase = getServerSupabase()

export async function GET(request, { params }) {
  const { id } = params
  
  const validationResult = uuidSchema.safeParse(id)
  if (!validationResult.success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
      }
      throw error
    }

    const { data: transacoes, error: transError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false })

    if (transError) throw transError

    const saldo = await calculateBalance(id)

    return NextResponse.json({
      cliente: { ...cliente, saldo },
      transacoes
    })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const { id } = params

  const idValidation = uuidSchema.safeParse(id)
  if (!idValidation.success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const body = await request.json()
    
    // MUDANÇA AQUI: .partial() permite enviar apenas campos parciais (ex: só status)
    const validationResult = clienteSchema.partial().safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const validData = validationResult.data

    // Removemos chaves undefined para não apagar dados existentes
    const updatePayload = Object.fromEntries(
      Object.entries(validData).filter(([_, v]) => v !== undefined)
    )

    const { data, error } = await supabase
      .from('clientes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ cliente: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = params

  const idValidation = uuidSchema.safeParse(id)
  if (!idValidation.success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}