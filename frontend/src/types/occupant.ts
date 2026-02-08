export interface Occupant {
  id: number
  roomId: number
  fullName: string
  phone: string | null
  idNumber: string | null
  idType: string | null
  address: string | null
  dob: string | null
  avatarUrl: string | null
  idFrontUrl: string | null
  idBackUrl: string | null
  tempResidenceUrl: string | null
  note: string | null
  zaloUserId: string | null
  createdAt: string
}

export interface CreateOccupantInput {
  fullName: string
  phone?: string
  idNumber?: string
  idType?: string
  address?: string
  dob?: string
  avatarUrl?: string
  idFrontUrl?: string
  idBackUrl?: string
  tempResidenceUrl?: string
  note?: string
  zaloUserId?: string
}

export interface UpdateOccupantInput {
  fullName: string
  phone?: string
  idNumber?: string
  idType?: string
  address?: string
  dob?: string
  avatarUrl?: string
  idFrontUrl?: string
  idBackUrl?: string
  tempResidenceUrl?: string
  note?: string
  zaloUserId?: string
}
