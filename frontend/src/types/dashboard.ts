export interface DashboardData {
  summary: {
    totalProducts: number
    totalCategories: number
    totalSuppliers: number
    lowStockProducts: number
  }
  recentActivities: Array<{
    id: string
    productId: string
    type: 'IN' | 'OUT'
    quantity: number
    notes: string | null
    createdAt: string
    product: {
      id: string
      sku: string
      name: string
      unit: string
    }
    user: {
      id: string
      name: string
    }
  }>
  lowStockItems: Array<{
    id: string
    sku: string
    name: string
    unit: string
    currentStock: number
    minimumStock: number
    categoryName: string
    supplierName: string
  }>
}
