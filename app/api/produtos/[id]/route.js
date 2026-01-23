import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { produtoSchema, uuidSchema } from '@/lib/validation'
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
      .update({
        nome: validData.nome,
        preco: validData.preco,
        categoria: validData.categoria,
        ativo: validData.ativo,
        valor_taxa: validData.valor_taxa || 0
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ produto: data })
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
      .from('produtos')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}