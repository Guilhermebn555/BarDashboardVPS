/**
 * Centralized error handling utilities
 * Provides consistent error handling and user-friendly messages
 */

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
  }
}

/**
 * Handles API errors and returns user-friendly messages
 * @param {unknown} error - The error object
 * @returns {string} User-friendly error message
 */
export const handleAPIError = (error) => {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 400:
        return 'Dados inválidos. Verifique as informações e tente novamente.'
      case 401:
        return 'Não autorizado. Faça login novamente.'
      case 403:
        return 'Acesso negado. Você não tem permissão para esta ação.'
      case 404:
        return 'Recurso não encontrado.'
      case 409:
        return 'Conflito. O recurso já existe ou foi modificado.'
      case 422:
        return 'Dados inválidos. Verifique os campos obrigatórios.'
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.'
      default:
        return `Erro ${error.statusCode}: ${error.message}`
    }
  }

  if (error instanceof TypeError) {
    return 'Erro de conexão. Verifique sua internet.'
  }

  if (error instanceof Error) {
    return error.message || 'Ocorreu um erro inesperado.'
  }

  return 'Erro inesperado. Tente novamente.'
}

/**
 * Wraps fetch calls with consistent error handling
 * @param {string} url - The API endpoint
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} The response data
 * @throws {APIError} If the response is not ok
 */
export const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new APIError(response.status, errorText || response.statusText)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    throw new Error('Falha na conexão com o servidor')
  }
}