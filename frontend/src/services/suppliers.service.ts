import api from './api'
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest, PaginatedResponse, PaginationParams } from '@/types'

export const suppliersService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Supplier>> {
    const response = await api.get<PaginatedResponse<Supplier>>('/suppliers', { params })
    return response.data
  },

  async getById(id: string): Promise<Supplier> {
    const response = await api.get<Supplier>(`/suppliers/${id}`)
    return response.data
  },

  async create(data: CreateSupplierRequest): Promise<Supplier> {
    const response = await api.post<Supplier>('/suppliers', data)
    return response.data
  },

  async update(id: string, data: UpdateSupplierRequest): Promise<Supplier> {
    const response = await api.put<Supplier>(`/suppliers/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`)
  },
}
