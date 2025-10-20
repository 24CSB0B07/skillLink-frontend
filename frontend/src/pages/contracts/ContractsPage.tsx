import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { listContracts } from '@/api/contracts';
import { cn } from '@/lib/utils';
import useWebSocket from 'react-use-websocket';
import React from "react";

interface Contract {
  id: string;
  title: string;
  status: 'active' | 'pending' | 'completed';
}

const ContractCard = React.memo(({ contract }: { contract: Contract }) => (
  <Card className={cn(
    'mb-4 bg-gradient-to-r from-indigo-50 to-sky-50 hover:from-indigo-100 hover:to-sky-100',
    'transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg'
  )}>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-semibold text-indigo-800">{contract.title || contract.id}</CardTitle>
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
      <Link to={`/contracts/${contract.id}`}>
        <Button variant="outline" size="sm" className="text-white bg-indigo-500 hover:bg-indigo-600">
          View
        </Button>
      </Link>
    </CardContent>
  </Card>
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
        prev.map((c) => (c.id === updatedContract.id ? updatedContract : c))
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

  const filteredContracts = filter === 'all' ? contracts : contracts.filter((c) => c.status === filter);

  if (error) return <div className="text-center text-red-600">{error}</div>;
  if (!contracts.length && !loading) return <div className="text-center text-gray-600">No contracts.</div>;

  return (
    <div className="container p-6 mx-auto">
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'pending', 'completed'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            className={cn(
              'transition-all duration-300',
              filter === f && 'bg-indigo-500 hover:bg-indigo-600 text-white'
            )}
            onClick={() => setFilter(f as any)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>
      
      {loading && <div className="text-center text-gray-600">Loading...</div>}
      
      {/* Regular scroll container instead of react-window */}
      <div className="max-h-[600px] overflow-y-auto space-y-4">
        {filteredContracts.map((contract) => (
          <ContractCard key={contract.id} contract={contract} />
        ))}
      </div>
      
      <Button
        className="mt-4 text-white bg-indigo-500 hover:bg-indigo-600"
        onClick={() => setPage((p) => p + 1)}
        disabled={loading}
      >
        Load More
      </Button>
    </div>
  );
}