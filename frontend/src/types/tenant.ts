export interface Tenant {
  id: number
  ownerUserId: number
  fullName: string
  phone: string | null
  idNumber: string | null
  idType: string | null
  address: string | null
  createdAt: string
}

export interface CreateTenantInput {
  fullName: string
  phone?: string
  idNumber?: string
  idType?: string
  address?: string
}

export interface UpdateTenantInput {
  fullName: string
  phone?: string
  idNumber?: string
  idType?: string
  address?: string
}
