import toast from 'react-hot-toast'
import { fetchUploadAsBlobUrl } from '@/api/files'

type Props = {
  href: string
  className?: string
  title?: string
  children: React.ReactNode
}

/** Opens upload paths with Bearer auth via blob URL; external http(s) links open normally. */
export function ProtectedDocAnchor({ href, className, title, children }: Props) {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} title={title}>
        {children}
      </a>
    )
  }
  return (
    <a
      href="#"
      className={className}
      title={title}
      onClick={async (e) => {
        e.preventDefault()
        try {
          const blobUrl = await fetchUploadAsBlobUrl(href)
          window.open(blobUrl, '_blank', 'noopener,noreferrer')
          window.setTimeout(() => URL.revokeObjectURL(blobUrl), 120_000)
        } catch {
          toast.error('Không mở được tài liệu.')
        }
      }}
    >
      {children}
    </a>
  )
}
