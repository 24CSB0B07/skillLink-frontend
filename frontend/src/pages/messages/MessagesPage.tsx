import { useEffect, useState } from 'react'
import { listThreads } from '@/api/messages'
import { Link } from 'react-router-dom'

export default function MessagesPage() {
  const [threads, setThreads] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    listThreads()
      .then(setThreads)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!threads || threads.length === 0) return <div>No messages.</div>

  return (
    <div className="grid gap-2">
      {threads.map((t) => (
        <Link key={t.id} to={`/messages/${t.id}`} className="rounded border p-3">
          <div className="font-medium">{t.title || t.id}</div>
          <div className="text-sm text-muted-foreground">{t.lastMessage?.content}</div>
        </Link>
      ))}
    </div>
  )
}
