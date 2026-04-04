import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { sanitizeError } from '@/lib/api-utils'

export async function GET(request) {
  const supabase = getServerSupabase()
  try {
    const { data, error } = await supabase.from('produtos_emprestimo').select('*').order('nome')
    if (error) throw error
    return NextResponse.json({ produtos: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function POST(request) {
  const supabase = getServerSupabase()
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from('produtos_emprestimo')
      .insert([{ nome: body.nome }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ produto: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}

export async function DELETE(request) {
    const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    try {
      const { error } = await supabase.from('produtos_emprestimo').delete().eq('id', id)
      if (error) throw error
      return NextResponse.json({ success: true })
    } catch (error) {
      return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
    }
  }