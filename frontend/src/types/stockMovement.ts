export type MovementType = 'IN' | 'OUT'

export interface StockMovement {
  id: string
  productId: string
  type: MovementType
  quantity: number
  notes: string | null
  createdBy: string
  createdAt: string
  product?: {
    id: string
    sku: string
    name: string
    unit: string
  }
  user?: {
    id: string
    name: string
  }
}

export interface StockInRequest {
  productId: string
  quantity: number
  notes?: string
}

export interface StockOutRequest {
  productId: string
  quantity: number
  notes?: string
}
