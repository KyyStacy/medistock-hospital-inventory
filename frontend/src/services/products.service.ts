import api from './api'
import type { Product, CreateProductRequest, UpdateProductRequest, PaginatedResponse, PaginationParams } from '@/types'

export const productsService = {
  async getAll(params?: PaginationParams & { categoryId?: string; supplierId?: string }): Promise<PaginatedResponse<Product>> {
    const response = await api.get<PaginatedResponse<Product>>('/products', { params })
    return response.data
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`)
    return response.data
  },

  async create(data: CreateProductRequest): Promise<Product> {
    const response = await api.post<Product>('/products', data)
    return response.data
  },

  async update(id: string, data: UpdateProductRequest): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },
}
