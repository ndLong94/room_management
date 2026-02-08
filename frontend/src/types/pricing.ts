export interface PricingSetting {
  id: number
  ownerUserId: number
  elecPrice: string
  waterPrice: string
  currency: string
  updatedAt: string
}

export interface UpdatePricingInput {
  elecPrice: number
  waterPrice: number
  currency?: string
}
