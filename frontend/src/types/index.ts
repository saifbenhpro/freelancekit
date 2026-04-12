export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REFUSED'

export interface Client {
  id: string
  name: string
  companyName?: string
  siret?: string
  email?: string
  phone?: string
  address?: string
  userId: string
}

export interface QuoteLine {
  id: string
  description: string
  detail?: string
  quantity: number
  unit: string
  unitPrice: number
  discount: number
  order: number
  quoteId: string
}

export interface Quote {
  id: string
  number: string
  status: QuoteStatus
  clientId: string
  client: Client
  lines: QuoteLine[]
  taxRate: number
  validUntil?: string
  shareToken?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  companyName?: string
  siret?: string
  phone?: string
  address?: string
  createdAt: string
}

export function lineTotal(line: { quantity: number; unitPrice: number; discount: number }) {
  const gross = line.quantity * line.unitPrice
  return gross * (1 - (line.discount ?? 0) / 100)
}

export function quoteSubtotal(lines: QuoteLine[]) {
  return lines.reduce((s, l) => s + lineTotal(l), 0)
}

export function quoteTTC(lines: QuoteLine[], taxRate: number) {
  return quoteSubtotal(lines) * (1 + taxRate / 100)
}

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  ACCEPTED: 'Accepté',
  REFUSED: 'Refusé',
}

export const STATUS_COLORS: Record<QuoteStatus, 'default' | 'info' | 'success' | 'error'> = {
  DRAFT: 'default',
  SENT: 'info',
  ACCEPTED: 'success',
  REFUSED: 'error',
}

export const UNITS = ['h', 'j', 'forfait', 'mois', 'unité', 'livraison', 'article']
