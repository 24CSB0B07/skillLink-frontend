import { api } from './axios'

export const listThreads = async () => {
  const { data } = await api.get('/messages/threads')
  return data
}

export const getThread = async (id: string) => {
  const { data } = await api.get(`/messages/threads/${id}`)
  return data
}

export const sendMessage = async (threadId: string, content: string) => {
  const { data } = await api.post(`/messages/threads/${threadId}/messages`, { content })
  return data
}
