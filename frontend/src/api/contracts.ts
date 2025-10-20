import { api } from './axios';

// Update the Contract interface to include client and freelancer
export interface Contract {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed';
  milestones?: { 
    id: string; 
    title: string; 
    status: 'pending' | 'submitted' | 'approved';
    createdAt?: string;
  }[];
  // Add these properties
  client?: {
    id: string;
    name: string;
    avatar?: string;
  };
  freelancer?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export const listContracts = async ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}): Promise<Contract[]> => {
  try {
    const { data } = await api.get('/contracts', { params: { page, limit } });
    return data;
  } catch (error: any) {
    throw new Error(`Failed to fetch contracts: ${error.response?.data?.message || error.message}`);
  }
};

export const getContract = async (id: string): Promise<Contract> => {
  try {
    const { data } = await api.get(`/contracts/${id}`);
    return data;
  } catch (error: any) {
    throw new Error(`Failed to fetch contract ${id}: ${error.response?.data?.message || error.message}`);
  }
};

export const approveDeliverable = async (contractId: string, milestoneId: string): Promise<void> => {
  try {
    await api.post(`/contracts/${contractId}/milestones/${milestoneId}/approve`);
  } catch (error: any) {
    throw new Error(`Failed to approve deliverable: ${error.response?.data?.message || error.message}`);
  }
};