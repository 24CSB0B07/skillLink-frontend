import { api } from './axios'

export interface CreateJobInput {
  title: string
  description: string
  budget?: number
}

export const createJob = async (input: CreateJobInput) => {
  const { data } = await api.post('/jobs', input)
  return data
}
