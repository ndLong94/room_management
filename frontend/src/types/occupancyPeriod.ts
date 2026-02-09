export interface OccupancyPeriod {
  id: number
  roomId: number
  propertyId: number
  startMonth: number | null
  startYear: number | null
  endMonth: number
  endYear: number
  depositAmount?: number | null
  depositDate?: string | null
  paymentDay?: number | null
  contractUrl?: string | null
  finalElecReading?: number | string | null
  finalWaterReading?: number | string | null
  createdAt: string
}

export interface OccupancyPeriodOccupant {
  id: number
  periodId: number
  fullName: string
  phone?: string | null
  idNumber?: string | null
  idType?: string | null
  address?: string | null
  dob?: string | null
  avatarUrl?: string | null
  idFrontUrl?: string | null
  idBackUrl?: string | null
  tempResidenceUrl?: string | null
  note?: string | null
  createdAt: string
}
