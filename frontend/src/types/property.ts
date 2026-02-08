export interface Property {
  id: number
  ownerUserId: number
  name: string
  address: string | null
  note: string | null
  elecPrice?: number
  waterPrice?: number
  createdAt: string
}

export interface CreatePropertyInput {
  name: string
  address?: string
  note?: string
  elecPrice?: number
  waterPrice?: number
}

export interface UpdatePropertyInput {
  name: string
  address?: string
  note?: string
  elecPrice?: number
  waterPrice?: number
}
