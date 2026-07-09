import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function getUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    PCS: 'Pcs',
    BOX: 'Box',
    PACK: 'Pack',
    BOTTLE: 'Botol',
    UNIT: 'Unit',
  }
  return labels[unit] || unit
}

export function getStockStatus(currentStock: number, minimumStock: number): 'critical' | 'low' | 'normal' {
  if (currentStock <= 0) return 'critical'
  if (currentStock <= minimumStock) return 'low'
  return 'normal'
}
