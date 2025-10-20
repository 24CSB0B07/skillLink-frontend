import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listReviews } from '@/api/reviews';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import useWebSocket from 'react-use-websocket';
import React from "react";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  contractId: string;
}

const ReviewCard = React.memo(({ review }: { review: Review }) => (
  <Card className={cn(
    'mb-4 bg-gradient-to-r from-indigo-50 to-sky-50 hover:from-indigo-100 hover:to-sky-100',
    'transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-lg'
  )}>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-semibold text-indigo-800">
        Rating: {review.rating}/5
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-sm text-gray-600">{review.comment || 'No comment provided'}</div>
      <div className="mt-1 text-xs text-muted-foreground">Contract ID: {review.contractId}</div>
    </CardContent>
  </Card>
));

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<number | 'all'>('all');

  const { lastMessage } = useWebSocket(`ws://api.skilllink.com/reviews/updates`, {
    onMessage: (event) => {
      const updatedReview = JSON.parse(event.data);
      setReviews((prev) =>
        prev.some((r) => r.id === updatedReview.id)
          ? prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
          : [updatedReview, ...prev]
      );
    },
  });

  const fetchReviews = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await listReviews(user.id, { page, limit: 20 });
      setReviews((prev) => (page === 1 ? data : [...prev, ...data]));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = filter === 'all' ? reviews : reviews.filter((r) => r.rating === filter);

  if (!user) return <div className="text-center text-gray-600">Please login</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;
  if (!reviews.length && !loading) return <div className="text-center text-gray-600">No reviews yet.</div>;

  return (
    <div className="container p-6 mx-auto">
      <div className="flex gap-2 mb-6">
        {['all', 5, 4, 3, 2, 1].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            className={cn(
              'transition-all duration-300',
              filter === f && 'bg-indigo-500 hover:bg-indigo-600 text-white'
            )}
            onClick={() => setFilter(f as any)}
          >
            {f === 'all' ? 'All' : `${f} Star${f === 1 ? '' : 's'}`}
          </Button>
        ))}
      </div>
      
      {loading && <div className="text-center text-gray-600">Loading...</div>}
      
      {/* Regular scroll container instead of react-window */}
      <div className="max-h-[600px] overflow-y-auto space-y-4">
        {filteredReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
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