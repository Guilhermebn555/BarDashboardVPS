import { z } from 'zod'

export const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  telefone: z.string().max(20).nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  apelidos: z.array(z.string().max(100)).max(10).optional(),
  dia_pagamento: z.number().int().min(1).max(31).nullable().optional(),
  limite_credito: z.number().min(0).max(999999).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  foto_path: z.string().max(500).nullable().optional(),
  status: z.enum(['ativo', 'suspenso', 'cancelado']).optional()
})

export const transacaoSchema = z.object({
  cliente_id: z.string().uuid('ID de cliente inválido'),
  tipo: z.enum(['compra', 'abate'], { errorMap: () => ({ message: 'Tipo deve ser compra ou abate' }) }),
  valor: z.number().positive('Valor deve ser positivo').max(999999),
  dados: z.record(z.any()).optional(),
  observacoes: z.string().max(500).nullable().optional()
})

export const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  preco: z.number().positive('Preço deve ser positivo').max(999999),
  categoria: z.string().max(100).nullable().optional(),
  ativo: z.boolean().optional(),
  valor_taxa: z.number().optional().nullable()
})

export const compraPixSchema = z.object({
  nome_cliente: z.string().min(1, 'Nome do cliente é obrigatório').max(200),
  itens: z.array(z.object({
    nome: z.string().min(1).max(200),
    preco: z.number().positive().max(999999),
    quantidade: z.number().int().positive().max(1000)
  })).min(1, 'Adicione pelo menos um item'),
  total: z.number().positive().max(999999)
})

export const mesaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  itens: z.array(z.any()).optional(),
  observacoes: z.string().max(500).nullable().optional(),
  logs: z.array(z.any()).optional()
})

export const searchQuerySchema = z.string().max(100).optional()

export const uuidSchema = z.string().uuid('ID inválido')
