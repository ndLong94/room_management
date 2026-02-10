import type { Tenant } from './tenant'

export interface RoomLease {
  id: number
  roomId: number
  tenantId: number
  active: boolean
  moveInDate: string | null
  moveOutDate: string | null
  depositAmount: number | string
  createdAt: string
  tenant?: Tenant | null
}

export interface CreateRoomLeaseInput {
  tenantId: number
  moveInDate?: string
  moveOutDate?: string
  depositAmount: number
}

export interface UpdateRoomLeaseInput {
  moveInDate?: string
  moveOutDate?: string
  depositAmount?: number
}
