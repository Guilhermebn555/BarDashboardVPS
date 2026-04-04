import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { sanitizeError } from '@/lib/api-utils'

export async function PATCH(request, { params }) {
  const supabase = getServerSupabase()
  const { id } = params
  
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('emprestimos')
      .update({ devolvido: body.devolvido })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ emprestimo: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const supabase = getServerSupabase()
  const { id } = params
  
  try {
    const { error } = await supabase
      .from('emprestimos')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}