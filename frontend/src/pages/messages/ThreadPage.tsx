import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getThread, sendMessage } from '@/api/messages'
import { Button } from '@/components/ui/button'

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>()
  const [thread, setThread] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getThread(id)
      .then(setThread)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const onSend = async () => {
    if (!id || !content.trim()) return
    try {
      await sendMessage(id, content)
      setContent('')
      // naive reload
      const t = await getThread(id)
      setThread(t)
    } catch (e: any) {
      alert(e.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!thread) return <div>Not found</div>

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        {(thread.messages || []).map((m: any) => (
          <div key={m.id} className="rounded border p-2 text-sm">
            <div className="mb-1 font-medium">{m.sender?.name || m.senderId}</div>
            <div className="text-muted-foreground">{m.content}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 rounded-md border px-3 py-2" placeholder="Type a message" value={content} onChange={(e) => setContent(e.target.value)} />
        <Button onClick={onSend}>Send</Button>
      </div>
    </div>
  )
}
