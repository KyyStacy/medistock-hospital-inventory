import api from './api'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, PaginatedResponse, PaginationParams } from '@/types'

export const categoriesService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Category>> {
    const response = await api.get<PaginatedResponse<Category>>('/categories', { params })
    return response.data
  },

  async getById(id: string): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`)
    return response.data
  },

  async create(data: CreateCategoryRequest): Promise<Category> {
    const response = await api.post<Category>('/categories', data)
    return response.data
  },

  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
