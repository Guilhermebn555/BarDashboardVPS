import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { 
  clienteSchema, 
  transacaoSchema, 
  produtoSchema, 
  compraPixSchema, 
  mesaSchema,
  searchQuerySchema,
  uuidSchema
} from '@/lib/validation'

const supabase = getServerSupabase()

async function calculateBalance(clienteId) {
  const { data: transacoes, error } = await supabase
    .from('transacoes')
    .select('tipo, valor')
    .eq('cliente_id', clienteId)

  if (error) {
    console.error('Error fetching transactions:', error)
    return 0
  }

  let totalAbates = 0
  let totalCompras = 0

  transacoes.forEach(t => {
    if (t.tipo === 'abate') {
      totalAbates += parseFloat(t.valor)
    } else if (t.tipo === 'compra') {
      totalCompras += parseFloat(t.valor)
    }
  })

  return totalAbates - totalCompras
}

function sanitizeError(error) {
  if (process.env.NODE_ENV === 'production') {
    console.error('API Error:', error)
    return 'Erro ao processar requisição'
  }
  return error.message
}

export async function GET(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '') || '/'

  try {
    if (path === '/clientes' || path === '/clientes/') {
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
    }

    if (path.startsWith('/clientes/') && path.split('/').length === 3) {
      const id = path.split('/')[2]
      
      const validationResult = uuidSchema.safeParse(id)
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'ID inválido' },
          { status: 400 }
        )
      }

      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Cliente não encontrado' },
            { status: 404 }
          )
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
    }

    if (path === '/produtos' || path === '/produtos/') {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome')

      if (error) throw error

      return NextResponse.json({ produtos: data })
    }

    if (path === '/mesas' || path === '/mesas/') {
      const { data, error } = await supabase
        .from('mesas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return NextResponse.json({ mesas: data })
    }

    if (path === '/search' || path === '/search/') {
      const query = url.searchParams.get('q') || ''

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
    }

    if (path === '/compras-pix' || path === '/compras-pix/') {
      const { data, error } = await supabase
        .from('compras_pix')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return NextResponse.json({ compras: data })
    }

    return NextResponse.json({ message: 'API is working' })
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '') || '/'

  try {
    const body = await request.json()

    if (path === '/clientes' || path === '/clientes/') {
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
    }

    if (path === '/transacoes' || path === '/transacoes/') {
      const validationResult = transacaoSchema.safeParse(body)
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: validationResult.error.errors },
          { status: 400 }
        )
      }

      const validData = validationResult.data

      const { data, error } = await supabase
        .from('transacoes')
        .insert([{
          cliente_id: validData.cliente_id,
          tipo: validData.tipo,
          valor: validData.valor,
          dados: validData.dados || {},
          observacoes: validData.observacoes || null
        }])
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ transacao: data })
    }

    if (path === '/produtos' || path === '/produtos/') {
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
        .insert([{
          nome: validData.nome,
          preco: validData.preco,
          categoria: validData.categoria || null,
          ativo: validData.ativo !== false,
          valor_taxa: validData.valor_taxa || 0
        }])
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ produto: data })
    }

    if (path === '/mesas' || path === '/mesas/') {
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
        .insert([{
          nome: validData.nome,
          itens: validData.itens || [],
          observacoes: validData.observacoes || null,
          logs: validData.logs || []
        }])
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ mesa: data })
    }

    if (path === '/compras-pix' || path === '/compras-pix/') {
      const validationResult = compraPixSchema.safeParse(body)
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Dados inválidos', details: validationResult.error.errors },
          { status: 400 }
        )
      }

      const validData = validationResult.data

      const { data, error } = await supabase
        .from('compras_pix')
        .insert([{
          nome_cliente: validData.nome_cliente,
          itens: validData.itens,
          total: validData.total
        }])
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ compra: data })
    }

    return NextResponse.json({ error: 'Endpoint não encontrado' }, { status: 404 })
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '') || '/'

  try {
    const body = await request.json()

    if (path.startsWith('/clientes/') && path.split('/').length === 3) {
      const id = path.split('/')[2]

      const idValidation = uuidSchema.safeParse(id)
      if (!idValidation.success) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }

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
        .update({
          nome: validData.nome,
          apelidos: validData.apelidos,
          telefone: validData.telefone,
          email: validData.email,
          foto_path: validData.foto_path,
          dia_pagamento: validData.dia_pagamento,
          limite_credito: validData.limite_credito,
          tags: validData.tags
        })
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
    }

    if (path.startsWith('/produtos/') && path.split('/').length === 3) {
      const id = path.split('/')[2]

      const idValidation = uuidSchema.safeParse(id)
      if (!idValidation.success) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }

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
    }

    if (path.startsWith('/mesas/') && path.split('/').length === 3) {
      const id = path.split('/')[2]

      const idValidation = uuidSchema.safeParse(id)
      if (!idValidation.success) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }

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
    }

    if (path.startsWith('/compras-pix/') && path.split('/').length === 3) {
      const id = path.split('/')[2]

      const idValidation = uuidSchema.safeParse(id)
      if (!idValidation.success) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }

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
    }

    return NextResponse.json({ error: 'Endpoint não encontrado' }, { status: 404 })
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  const url = new URL(request.url)
  const path = url.pathname.replace('/api', '') || '/'

  try {
    if (path.startsWith('/clientes/') && path.split('/').length === 3) {
      const id = path.split('/')[2]

      const idValidation = uuidSchema.safeParse(id)
      if (!idValidation.success) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }

      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (path.startsWith('/produtos/') && path.split('/').length === 3) {
      const id = path.split('/')[2]

      const idValidation = uuidSchema.safeParse(id)
      if (!idValidation.success) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }

      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    if (path.startsWith('/mesas/') && path.split('/').length === 3) {
      const id = path.split('/')[2]

      const idValidation = uuidSchema.safeParse(id)
      if (!idValidation.success) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }

      const { error } = await supabase
        .from('mesas')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }
    
    if (path.startsWith('/compras-pix/') && path.split('/').length === 3) {
      const id = path.split('/')[2]

      const idValidation = uuidSchema.safeParse(id)
      if (!idValidation.success) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }

      const { error } = await supabase
        .from('compras_pix')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Endpoint não encontrado' }, { status: 404 })
  } catch (error) {
    return NextResponse.json(
      { error: sanitizeError(error) },
      { status: 500 }
    )
  }
}
