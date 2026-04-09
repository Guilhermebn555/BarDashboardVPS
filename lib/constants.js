/**
 * Centralized constants for the application
 * Contains payment methods, client statuses, database table names, and other magic strings
 */

// Payment Methods
export const PAYMENT_METHODS = Object.freeze({
  CASH: 'dinheiro',
  PIX: 'pix',
  CARD: 'cartao',
  FIADO: 'fiado'
})

export const PAYMENT_LABELS = Object.freeze({
  [PAYMENT_METHODS.CASH]: 'Dinheiro',
  [PAYMENT_METHODS.PIX]: 'PIX',
  [PAYMENT_METHODS.CARD]: 'Cartão',
  [PAYMENT_METHODS.FIADO]: 'Fiado / Caderneta'
})

// Client Statuses
export const CLIENT_STATUS = Object.freeze({
  ACTIVE: 'ativo',
  SUSPENDED: 'suspenso',
  CANCELLED: 'cancelado'
})

export const CLIENT_STATUS_LABELS = Object.freeze({
  [CLIENT_STATUS.ACTIVE]: 'Ativo',
  [CLIENT_STATUS.SUSPENDED]: 'Suspenso',
  [CLIENT_STATUS.CANCELLED]: 'Cancelado'
})

// Database Table Names
export const DB_TABLES = Object.freeze({
  CLIENTS: 'clientes',
  CLIENTS_WITH_BALANCE: 'clientes_com_saldo',
  MESAS: 'mesas',
  TRANSACTIONS: 'transacoes',
  PRODUCTS: 'produtos'
})

// Transaction Types
export const TRANSACTION_TYPES = Object.freeze({
  PURCHASE: 'compra',
  PAYMENT: 'pagamento'
})

export const TRANSACTION_LABELS = Object.freeze({
  [TRANSACTION_TYPES.PURCHASE]: 'Compra',
  [TRANSACTION_TYPES.PAYMENT]: 'Pagamento'
})

// Sort Options
export const SORT_OPTIONS = Object.freeze({
  NAME_ASC: 'nome_asc',
  NAME_DESC: 'nome_desc',
  BALANCE_ASC: 'saldo_asc',
  BALANCE_DESC: 'saldo_desc'
})