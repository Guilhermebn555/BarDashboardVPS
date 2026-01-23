import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { searchQuerySchema } from '@/lib/validation'
import { sanitizeError } from '@/lib/api-utils'

const supabase = getServerSupabase()

export async function GET(request) {
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''

  try {
    const validationResult = searchQuerySchema.safeParse(query)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Query inválida' },
        { status: 400 }
      )
    }

    if (!query) {
      return NextResponse.json({ clientes: [] })
    }

    const sanitizedQuery = query.replace(/[%_]/g, '\\$&')

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`nome.ilike.%${sanitizedQuery}%,telefone.ilike.%${sanitizedQuery}%`)
      .limit(10)

    if (error) throw error

    return NextResponse.json({ clientes: data })
  } catch (error) {
    return NextResponse.json({ error: sanitizeError(error) }, { status: 500 })
  }
}