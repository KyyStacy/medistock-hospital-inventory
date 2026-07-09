import api from './api'
import type { StockMovement, PaginatedResponse, PaginationParams, MovementType } from '@/types'

export const stockMovementsService = {
  async getAll(params?: PaginationParams & { type?: MovementType; productId?: string }): Promise<PaginatedResponse<StockMovement>> {
    const response = await api.get<PaginatedResponse<StockMovement>>('/stock-movements', { params })
    return response.data
  },
}
