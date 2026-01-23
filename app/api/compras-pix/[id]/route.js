import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { uuidSchema } from '@/lib/validation'
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
    const updateData = {}
    if (body.pago !== undefined) updateData.pago = body.pago
    if (body.cliente_id !== undefined) {
      const clienteIdValidation = uuidSchema.safeParse(body.cliente_id)
      if (!clienteIdValidation.success) {
        return NextResponse.json({ error: 'ID de cliente inválido' }, { status: 400 })
      }
      updateData.cliente_id = body.cliente_id
      updateData.enviado_para_cliente = true
    }

    const { data, error } = await supabase
      .from('compras_pix')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Compra não encontrada' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ compra: data })
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
      .from('compras_pix')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}