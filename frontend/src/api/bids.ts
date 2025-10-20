// src/api/bids.ts
// Unchanged
import { api } from './axios'

export interface CreateBidInput {
  jobId: string
  amount: number
  coverLetter: string
}

export const createBid = async (input: CreateBidInput) => {
  const { data } = await api.post('/bids', input)
  return data
}