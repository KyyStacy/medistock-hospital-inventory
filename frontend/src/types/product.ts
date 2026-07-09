import type { Category } from './category'
import type { Supplier } from './supplier'
import type { StockMovement } from './stockMovement'

export type Unit = 'PCS' | 'BOX' | 'PACK' | 'BOTTLE' | 'UNIT'

export interface Product {
  id: string
  sku: string
  name: string
  categoryId: string
  supplierId: string
  unit: Unit
  minimumStock: number
  currentStock: number
  description: string | null
  createdAt: string
  updatedAt: string
  category?: Pick<Category, 'id' | 'name'>
  supplier?: Pick<Supplier, 'id' | 'name'>
  stockMovements?: StockMovement[]
}

export interface CreateProductRequest {
  sku: string
  name: string
  categoryId: string
  supplierId: string
  unit: Unit
  minimumStock: number
  description?: string
}

export interface UpdateProductRequest {
  name?: string
  categoryId?: string
  supplierId?: string
  unit?: Unit
  minimumStock?: number
  description?: string
}
