import { useState, useCallback } from 'react';
import { createReview, type CreateReviewInput } from '@/api/reviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import useWebSocket from 'react-use-websocket';

export default function WriteReviewPage() {
  const [contractId, setContractId] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { sendMessage } = useWebSocket('ws://api.skilllink.com/reviews/updates');

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!contractId || !rating || Number(rating) < 1 || Number(rating) > 5) {
        setError('Please provide a valid contract ID and rating (1-5).');
        return;
      }
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const review = await createReview({ contractId, rating: Number(rating), comment });
        sendMessage(JSON.stringify(review));
        setSuccess('Review submitted successfully!');
        setContractId('');
        setRating('5');
        setComment('');
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [contractId, rating, comment, sendMessage]
  );

  return (
    <div className="container p-6 mx-auto">
      <Card className="max-w-xl mx-auto bg-gradient-to-r from-indigo-50 to-sky-50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-800">Write a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
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
              <label className="text-sm font-medium text-gray-700">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={cn(
                      'text-2xl',
                      Number(rating) >= star ? 'text-yellow-400' : 'text-gray-300',
                      'transition-colors duration-200'
                    )}
                    onClick={() => setRating(star.toString())}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Comment (optional)</label>
              <textarea
                className={cn(
                  'w-full min-h-28 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  'transition-all duration-300'
                )}
                placeholder="Share your feedback"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            {error && <div className="text-sm text-red-600 animate-pulse">{error}</div>}
            {success && <div className="text-sm text-green-600 animate-pulse">{success}</div>}
            <Button
              disabled={loading}
              className="text-white transition-colors bg-indigo-500 hover:bg-indigo-600"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}