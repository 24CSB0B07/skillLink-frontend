// src/api/jobs.ts
// Unchanged, but added skills to interfaces for future use
import { api } from './axios'

export interface JobSummary { id: string; title: string; budget?: number; description: string; skills?: string[] }
export interface JobDetail extends JobSummary { clientId: string; skills?: string[] }

export const listJobs = async () => {
  const { data } = await api.get<JobSummary[]>('/jobs')
  return data
}

export const getJob = async (id: string) => {
  const { data } = await api.get<JobDetail>(`/jobs/${id}`)
  return data
}