import { useQuery } from '@tanstack/react-query'
import { getHealth } from '@/api/health'

export function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: () => getHealth(),
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Home</h1>
      {isLoading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="text-red-600">Failed to reach API.</p>}
      {data && <p className="text-slate-600 dark:text-slate-400">API status: {data.status}</p>}
    </div>
  )
}
