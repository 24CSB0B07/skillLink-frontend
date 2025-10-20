import { api } from './axios';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  contractId: string;
}

export interface CreateReviewInput {
  contractId: string;
  rating: number;
  comment?: string;
}

export const listReviews = async (
  userId: string,
  { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
): Promise<Review[]> => {
  try {
    const { data } = await api.get(`/users/${userId}/reviews`, { params: { page, limit } });
    return data;
  } catch (error: any) {
    throw new Error(`Failed to fetch reviews: ${error.response?.data?.message || error.message}`);
  }
};

export const createReview = async (input: CreateReviewInput): Promise<Review> => {
  try {
    const { data } = await api.post('/reviews', input);
    return data;
  } catch (error: any) {
    throw new Error(`Failed to create review: ${error.response?.data?.message || error.message}`);
  }
};