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
