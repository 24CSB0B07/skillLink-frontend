import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getContract, approveDeliverable, type Contract } from '@/api/contracts';
import { cn, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import useWebSocket from 'react-use-websocket';
import React from 'react';

interface Milestone {
  id: string;
  title: string;
  status: 'pending' | 'submitted' | 'approved';
  createdAt?: string;
}

const MilestoneItem = React.memo(({ milestone, onApprove }: { milestone: Milestone; onApprove: (id: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className={cn(
      'glass rounded-lg p-4 mb-3 hover:shadow-lg transition-all duration-300'
    )}
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium text-indigo-800">{milestone.title || milestone.id}</div>
        <div className={cn(
          'text-sm',
          milestone.status === 'approved' && 'text-green-600 animate-pulse',
          milestone.status === 'submitted' && 'text-yellow-600',
          milestone.status === 'pending' && 'text-indigo-600'
        )}>
          {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
        </div>
        <p className="text-xs text-indigo-600">
          {milestone.createdAt ? formatDate(milestone.createdAt) : 'No date'}
        </p>
      </div>
      {milestone.status === 'submitted' && (
        <Button
          size="sm"
          variant="gradient"
          className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600"
          onClick={() => onApprove(milestone.id)}
        >
          Approve
        </Button>
      )}
    </div>
  </motion.div>
));

export default function ContractDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { lastMessage } = useWebSocket(`ws://api.skilllink.com/contracts/${id}/updates`, {
    onMessage: (event) => {
      const updatedContract = JSON.parse(event.data);
      setContract(updatedContract);
    },
  });

  const fetchContract = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getContract(id);
      setContract(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const onApprove = useCallback(async (milestoneId: string) => {
    if (!id) return;
    try {
      await approveDeliverable(id, milestoneId);
      setContract((prev) =>
        prev
          ? {
              ...prev,
              milestones: prev.milestones?.map((m) =>
                m.id === milestoneId ? { ...m, status: 'approved' as const } : m
              ),
            }
          : prev
      );
    } catch (e: any) {
      alert(e.message);
    }
  }, [id]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-indigo-100 to-sky-100">
      <div className="container max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8 text-3xl font-bold text-center text-indigo-800"
        >
          Contract Details
        </motion.h1>
        <AnimatePresence>
          {loading ? (
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
          ) : !contract ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-indigo-800"
            >
              Not found
            </motion.div>
          ) : (
            <Card className="glass">
              <CardHeader className="flex flex-row items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={contract.client?.avatar || contract.freelancer?.avatar} />
                  <AvatarFallback>
                    {contract.client?.name?.charAt(0) || contract.freelancer?.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold text-indigo-800">
                    {contract.title || contract.id}
                  </CardTitle>
                  <p className="text-sm text-indigo-600">
                    {contract.client?.name || contract.freelancer?.name || 'Unknown'}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className={cn(
                  'text-sm font-medium mb-4',
                  contract.status === 'active' && 'text-green-600',
                  contract.status === 'pending' && 'text-yellow-600',
                  contract.status === 'completed' && 'text-blue-600'
                )}>
                  Status: {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </div>
                {(contract.milestones || []).map((m) => (
                  <MilestoneItem key={m.id} milestone={m} onApprove={onApprove} />
                ))}
                {!contract.milestones?.length && (
                  <p className="text-center text-indigo-800">No milestones.</p>
                )}
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}