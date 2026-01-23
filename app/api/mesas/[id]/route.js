import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { mesaSchema, uuidSchema } from '@/lib/validation'
import { sanitizeError } from '@/lib/api-utils'

const supabase = getServerSupabase()

export async function PUT(request, { params }) {
  const { id } = params

  const idValidation = uuidSchema.safeParse(id)
  if (!idValidation.success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

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
      .update({
        nome: validData.nome,
        itens: validData.itens,
        observacoes: validData.observacoes,
        logs: validData.logs
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Mesa não encontrada' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ mesa: data })
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
      .from('mesas')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}