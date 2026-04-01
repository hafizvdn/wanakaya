import { format } from 'date-fns'

/**
 * @param {number} sen - Amount in sen (integer)
 * @returns {string} e.g. "RM 12.50"
 */
export function formatCurrency(sen) {
  return `RM ${(sen / 100).toFixed(2)}`
}

/**
 * @param {string|Date} date
 * @returns {string} e.g. "26 Mar 2026"
 */
export function formatDate(date) {
  return format(new Date(date), 'dd MMM yyyy')
}

/**
 * @param {number} value
 * @param {number} total
 * @returns {string} e.g. "42%"
 */
export function formatPercent(value, total) {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

/**
 * Converts a RM string input (e.g. "12.50") to sen integer.
 * @param {string|number} rm
 * @returns {number}
 */
export function rmToSen(rm) {
  return Math.round(parseFloat(rm) * 100)
}
