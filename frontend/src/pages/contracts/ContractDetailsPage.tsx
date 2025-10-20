import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getContract, approveDeliverable, type Contract } from '@/api/contracts'; // Import Contract from API
import { cn } from '@/lib/utils';
import useWebSocket from 'react-use-websocket';
import React from "react";

// Remove the local Contract and Milestone interfaces since we're importing them
// The imported Contract has milestones as optional, so we need to handle that

interface Milestone {
  id: string;
  title: string;
  status: 'pending' | 'submitted' | 'approved';
}

// Keep MilestoneItem the same
const MilestoneItem = React.memo(({ milestone, onApprove }: { milestone: Milestone; onApprove: (id: string) => void }) => (
  <div className={cn(
    'rounded-lg border p-4 mb-3 bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-sky-50',
    'transition-all duration-300 ease-in-out'
  )}>
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium text-indigo-800">{milestone.title || milestone.id}</div>
        <div className={cn(
          'text-sm',
          milestone.status === 'approved' && 'text-green-600 animate-pulse',
          milestone.status === 'submitted' && 'text-yellow-600',
          milestone.status === 'pending' && 'text-gray-600'
        )}>
          {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
        </div>
      </div>
      {milestone.status === 'submitted' && (
        <Button
          size="sm"
          className="text-white transition-colors bg-indigo-500 hover:bg-indigo-600"
          onClick={() => onApprove(milestone.id)}
        >
          Approve
        </Button>
      )}
    </div>
  </div>
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
      alert('Deliverable approved');
    } catch (e: any) {
      alert(e.message);
    }
  }, [id]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;
  if (!contract) return <div className="text-center text-gray-600">Not found</div>;

  return (
    <div className="container p-6 mx-auto">
      <Card className="bg-gradient-to-r from-indigo-50 to-sky-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-800">{contract.title || contract.id}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Handle the case where milestones might be undefined */}
          {(contract.milestones || []).map((m) => (
            <MilestoneItem key={m.id} milestone={m} onApprove={onApprove} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}