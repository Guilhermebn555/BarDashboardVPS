import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_VIDEOKE_SUPABASE_URL,
  process.env.VIDEOKE_SUPABASE_SECRET_KEY,
)

const updateSchema = z.object({
  pin_atual: z
    .string({ required_error: 'pin_atual é obrigatório' })
    .trim()
    .regex(/^\d{4}$/, 'O PIN deve ter exatamente 4 dígitos'),
})

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) throw error
    return NextResponse.json({ configuracao: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  let body
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json({ erro: 'JSON inválido' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return NextResponse.json({ erro: issue?.message || 'Dados inválidos' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .update({ pin_atual: parsed.data.pin_atual })
      .eq('id', 1)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ configuracao: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 })
  }
}