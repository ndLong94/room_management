import { useEffect, useState } from 'react'
import { fetchUploadAsBlobUrl } from '@/api/files'

/**
 * Resolves app-relative upload paths (e.g. `/uploads/...`) to a blob URL using the auth axios client.
 * Absolute http(s) URLs are returned as-is.
 */
export function useAuthenticatedUploadUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!path) {
      setUrl(null)
      setError(false)
      return
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      setUrl(path)
      setError(false)
      return
    }
    let revoked = false
    let created: string | undefined
    setLoading(true)
    setError(false)
    fetchUploadAsBlobUrl(path)
      .then((u) => {
        if (!revoked) {
          created = u
          setUrl(u)
        }
      })
      .catch(() => {
        if (!revoked) setError(true)
      })
      .finally(() => {
        if (!revoked) setLoading(false)
      })

    return () => {
      revoked = true
      if (created?.startsWith('blob:')) {
        URL.revokeObjectURL(created)
      }
    }
  }, [path])

  return { url, loading, error }
}
