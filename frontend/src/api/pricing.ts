import { api } from '@/lib/api'
import type { PricingSetting, UpdatePricingInput } from '@/types/pricing'

export async function fetchPricing(): Promise<PricingSetting> {
  const { data } = await api.get<PricingSetting>('/api/settings/pricing')
  return data
}

export async function updatePricing(input: UpdatePricingInput): Promise<PricingSetting> {
  const { data } = await api.put<PricingSetting>('/api/settings/pricing', input)
  return data
}
