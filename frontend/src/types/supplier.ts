export interface Supplier {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export interface CreateSupplierRequest {
  name: string
  phone?: string
  email?: string
  address?: string
}

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>
