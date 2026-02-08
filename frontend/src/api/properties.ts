import { api } from '@/lib/api'
import type { CreatePropertyInput, Property, UpdatePropertyInput } from '@/types/property'

const BASE = '/api/properties'

export async function fetchProperties(): Promise<Property[]> {
  const { data } = await api.get<Property[]>(BASE)
  return data
}

export async function fetchProperty(id: number): Promise<Property> {
  const { data } = await api.get<Property>(`${BASE}/${id}`)
  return data
}

export async function createProperty(input: CreatePropertyInput): Promise<Property> {
  const { data } = await api.post<Property>(BASE, input)
  return data
}

export async function updateProperty(id: number, input: UpdatePropertyInput): Promise<Property> {
  const { data } = await api.put<Property>(`${BASE}/${id}`, input)
  return data
}

export async function deleteProperty(id: number): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
