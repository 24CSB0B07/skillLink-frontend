import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWallet, fundEscrow, releaseEscrow, type FundInput, type ReleaseInput } from '@/api/wallet';
import { cn } from '@/lib/utils';
import useWebSocket from 'react-use-websocket';
import React from "react";

interface Wallet {
  balance: number;
}

const WalletCard = React.memo(({ balance }: { balance: number }) => (
  <Card className={cn(
    'bg-gradient-to-r from-indigo-50 to-sky-50 hover:from-indigo-100 hover:to-sky-100',
    'transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg'
  )}>
    <CardHeader>
      <CardTitle className="text-2xl font-bold text-indigo-800">Wallet</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-lg font-semibold text-green-600 animate-pulse">
        Balance: ${balance.toFixed(2)}
      </div>
    </CardContent>
  </Card>
));

const FundEscrowForm = React.memo(({ onFund }: { onFund: (input: FundInput) => Promise<void> }) => {
  const [contractId, setContractId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !amount || Number(amount) <= 0) {
      setError('Please provide a valid contract ID and amount.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onFund({ contractId, amount: Number(amount) });
      setContractId('');
      setAmount('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn(
      'max-w-xl bg-gradient-to-r from-indigo-50 to-sky-50',
      'transition-all duration-300'
    )}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-indigo-800">Fund Escrow</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Contract ID</label>
          <input
            className={cn(
              'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500',
              'transition-all duration-300'
            )}
            placeholder="Enter contract ID"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Amount ($)</label>
          <input
            className={cn(
              'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500',
              'transition-all duration-300'
            )}
            placeholder="Enter amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {error && <div className="text-sm text-red-600 animate-pulse">{error}</div>}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="text-white transition-colors bg-indigo-500 hover:bg-indigo-600"
        >
          {loading ? 'Funding...' : 'Fund Escrow'}
        </Button>
      </CardContent>
    </Card>
  );
});

const ReleaseEscrowForm = React.memo(({ onRelease }: { onRelease: (input: ReleaseInput) => Promise<void> }) => {
  const [contractId, setContractId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId) {
      setError('Please provide a valid contract ID.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onRelease({ contractId, milestoneId: milestoneId || undefined });
      setContractId('');
      setMilestoneId('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn(
      'max-w-xl bg-gradient-to-r from-indigo-50 to-sky-50',
      'transition-all duration-300'
    )}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-indigo-800">Release Escrow</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Contract ID</label>
          <input
            className={cn(
              'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500',
              'transition-all duration-300'
            )}
            placeholder="Enter contract ID"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Milestone ID (optional)</label>
          <input
            className={cn(
              'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500',
              'transition-all duration-300'
            )}
            placeholder="Enter milestone ID"
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
          />
        </div>
        {error && <div className="text-sm text-red-600 animate-pulse">{error}</div>}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="text-white transition-colors bg-indigo-500 hover:bg-indigo-600"
        >
          {loading ? 'Releasing...' : 'Release Escrow'}
        </Button>
      </CardContent>
    </Card>
  );
});

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { lastMessage, sendMessage } = useWebSocket('ws://api.skilllink.com/wallet/updates', {
    onMessage: (event) => {
      const updatedWallet = JSON.parse(event.data);
      setWallet(updatedWallet);
    },
  });

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getWallet();
      setWallet(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onFund = useCallback(async (input: FundInput) => {
    const data = await fundEscrow(input);
    setWallet((prev) => (prev ? { ...prev, balance: prev.balance - input.amount } : prev));
    sendMessage(JSON.stringify(data));
  }, [sendMessage]);

  const onRelease = useCallback(async (input: ReleaseInput) => {
    const data = await releaseEscrow(input);
    sendMessage(JSON.stringify(data));
  }, [sendMessage]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  return (
    <div className="container grid gap-6 p-6 mx-auto">
      <WalletCard balance={wallet?.balance ?? 0} />
      <FundEscrowForm onFund={onFund} />
      <ReleaseEscrowForm onRelease={onRelease} />
    </div>
  );
}