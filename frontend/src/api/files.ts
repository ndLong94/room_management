import { api } from '@/lib/api'

export interface FileUploadResponse {
  url: string
}

export async function uploadFile(file: File): Promise<FileUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<FileUploadResponse>('/api/files/upload', formData)
  return data
}

/** Relative path e.g. `/uploads/uuid.jpg` — requires auth (not public). */
export async function fetchUploadAsBlobUrl(relativePath: string): Promise<string> {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  const { data } = await api.get<Blob>(path, { responseType: 'blob' })
  return URL.createObjectURL(data)
}
