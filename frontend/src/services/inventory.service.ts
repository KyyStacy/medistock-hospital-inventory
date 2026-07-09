import api from './api'
import type { StockInRequest, StockOutRequest } from '@/types'

export const inventoryService = {
  async stockIn(data: StockInRequest) {
    const response = await api.post('/inventory/stock-in', data)
    return response.data
  },

  async stockOut(data: StockOutRequest) {
    const response = await api.post('/inventory/stock-out', data)
    return response.data
  },
}
