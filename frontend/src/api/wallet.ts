import { api } from './axios';

export interface Wallet {
  balance: number;
}

export interface FundInput {
  contractId: string;
  amount: number;
}

export interface ReleaseInput {
  contractId: string;
  milestoneId?: string;
}

export const getWallet = async (): Promise<Wallet> => {
  try {
    const { data } = await api.get('/wallet');
    return data;
  } catch (error: any) {
    throw new Error(`Failed to fetch wallet: ${error.response?.data?.message || error.message}`);
  }
};

export const fundEscrow = async (input: FundInput): Promise<Wallet> => {
  try {
    const { data } = await api.post('/wallet/fund', input);
    return data;
  } catch (error: any) {
    throw new Error(`Failed to fund escrow: ${error.response?.data?.message || error.message}`);
  }
};

export const releaseEscrow = async (input: ReleaseInput): Promise<Wallet> => {
  try {
    const { data } = await api.post('/wallet/release', input);
    return data;
  } catch (error: any) {
    throw new Error(`Failed to release escrow: ${error.response?.data?.message || error.message}`);
  }
};