import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { setAuthCookie } from '@/lib/auth'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const rateLimitResult = checkRateLimit(email.toLowerCase())
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.message,
          cooldownSeconds: rateLimitResult.cooldownSeconds
        },
        { status: 429 }
      )
    }

    const supabase = getServerSupabase()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('ativo', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { 
          error: 'Email ou senha incorretos',
          remainingAttempts: rateLimitResult.remainingAttempts
        },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { 
          error: 'Email ou senha incorretos',
          remainingAttempts: rateLimitResult.remainingAttempts
        },
        { status: 401 }
      )
    }

    resetRateLimit(email.toLowerCase())

    await setAuthCookie(user.id, user.email)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
