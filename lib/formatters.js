/**
 * Centralized formatting utilities for the application
 * Provides consistent formatting for currency, dates, and text normalization
 */

/**
 * Formats a number as Brazilian Real currency
 * @param {number} value - The numeric value to format
 * @returns {string} Formatted currency string (e.g., "R$ 1.234,56")
 */
export const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formats a date or date string to Brazilian format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., "25/12/2023 14:30")
 */
export const formatTime = (date) => {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  } catch (error) {
    console.warn('Invalid date provided to formatTime:', date);
    return '';
  }
};

/**
 * Normalizes text for searching by removing accents and special characters
 * @param {string} text - The text to normalize
 * @returns {string} Normalized text in lowercase without accents
 */
export const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-]/g, ' ')
    .replace(/[^\w\s]/g, '');
};