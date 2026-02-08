export type RoomStatus = 'VACANT' | 'OCCUPIED'

export interface Room {
  id: number
  propertyId: number
  name: string
  rentPrice: number
  status: RoomStatus
  contractUrl?: string | null
  paymentDay?: number | null
  createdAt: string
}

export interface CreateRoomInput {
  name: string
  rentPrice?: number
  status?: RoomStatus
  paymentDay?: number | null
}

export interface UpdateRoomInput {
  name: string
  rentPrice: number
  status: RoomStatus
  contractUrl?: string | null
  paymentDay?: number | null
}
