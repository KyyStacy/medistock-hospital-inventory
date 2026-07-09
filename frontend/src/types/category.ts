export interface Category {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface CreateCategoryRequest {
  name: string
  description?: string
}

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>
