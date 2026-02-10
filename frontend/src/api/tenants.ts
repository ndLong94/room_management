import { api } from '@/lib/api'
import type { CreateTenantInput, Tenant, UpdateTenantInput } from '@/types/tenant'

export async function fetchTenants(): Promise<Tenant[]> {
  const { data } = await api.get<Tenant[]>('/api/tenants')
  return data
}

export async function fetchTenant(id: number): Promise<Tenant> {
  const { data } = await api.get<Tenant>(`/api/tenants/${id}`)
  return data
}

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const { data } = await api.post<Tenant>('/api/tenants', input)
  return data
}

export async function updateTenant(id: number, input: UpdateTenantInput): Promise<Tenant> {
  const { data } = await api.put<Tenant>(`/api/tenants/${id}`, input)
  return data
}

export async function deleteTenant(id: number): Promise<void> {
  await api.delete(`/api/tenants/${id}`)
}
