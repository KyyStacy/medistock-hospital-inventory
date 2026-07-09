export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export { type User, type LoginRequest, type LoginResponse } from './auth'
export { type Category, type CreateCategoryRequest, type UpdateCategoryRequest } from './category'
export { type Supplier, type CreateSupplierRequest, type UpdateSupplierRequest } from './supplier'
export { type Product, type CreateProductRequest, type UpdateProductRequest, type Unit } from './product'
export { type StockMovement, type StockInRequest, type StockOutRequest, type MovementType } from './stockMovement'
export { type DashboardData } from './dashboard'
