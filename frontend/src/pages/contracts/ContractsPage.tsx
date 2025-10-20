import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { listContracts } from '@/api/contracts';
import { cn, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import useWebSocket from 'react-use-websocket';
import React from 'react';

interface Contract {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed';
  client?: { name: string; avatar?: string };
  freelancer?: { name: string; avatar?: string };
  createdAt?: string;
}

const ContractCard = React.memo(({ contract }: { contract: Contract }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
  >
    <Card className={cn(
      'glass mb-4 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]',
      'border-indigo-200'
    )}>
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Avatar className="w-10 h-10">
          <AvatarImage src={contract.client?.avatar || contract.freelancer?.avatar} />
          <AvatarFallback>
            {contract.client?.name?.charAt(0) || contract.freelancer?.name?.charAt(0) || 'C'}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg font-semibold text-indigo-800">
            {contract.title || contract.id}
          </CardTitle>
          <p className="text-sm text-indigo-600">
            {contract.client?.name || contract.freelancer?.name || 'Unknown'}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span className={cn(
          'text-sm font-medium',
          contract.status === 'active' && 'text-green-600',
          contract.status === 'pending' && 'text-yellow-600',
          contract.status === 'completed' && 'text-blue-600'
        )}>
          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
        </span>
        <div className="flex items-center gap-2">
          <p className="text-xs text-indigo-600">
            {contract.createdAt ? formatDate(contract.createdAt) : 'No date'}
          </p>
          <Link to={`/contracts/${contract.id}`}>
            <Button
              variant="gradient"
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600"
            >
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');

  const { lastMessage } = useWebSocket('ws://api.skilllink.com/contracts/updates', {
    onMessage: (event) => {
      const updatedContract = JSON.parse(event.data);
      setContracts((prev) =>
        prev.map((c) => (c.id === updatedContract.id ? { ...c, ...updatedContract } : c))
      );
    },
  });

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listContracts({ page, limit: 20 });
      setContracts((prev) => (page === 1 ? data : [...prev, ...data]));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const filteredContracts = Array.isArray(contracts)
    ? filter === 'all'
      ? contracts
      : contracts.filter((c) => c.status === filter)
    : [];

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-indigo-50 to-sky-50">
      <div className="container max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8 text-3xl font-bold text-center text-indigo-800"
        >
          Your Contracts
        </motion.h1>
        <div className="flex justify-center gap-2 mb-6">
          {['all', 'active', 'pending', 'completed'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'gradient' : 'outline'}
              className={cn(
                'transition-all duration-300',
                filter === f
                  ? 'bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white'
                  : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'
              )}
              onClick={() => setFilter(f as any)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <AnimatePresence>
          {loading && !contracts.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-indigo-800"
            >
              Loading...
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-red-500"
            >
              {error}
            </motion.div>
          ) : !filteredContracts.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-indigo-800"
            >
              No contracts.
            </motion.div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto space-y-4">
              {filteredContracts.map((contract) => (
                <ContractCard key={contract.id} contract={contract} />
              ))}
            </div>
          )}
        </AnimatePresence>
        <div className="mt-6 text-center">
          <Button
            variant="gradient"
            className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
          >
            Load More
          </Button>
        </div>
      </div>
    </div>
  );
}