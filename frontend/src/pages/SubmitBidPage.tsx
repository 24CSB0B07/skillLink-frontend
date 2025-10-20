// src/pages/SubmitBidPage.tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createBid } from '@/api/bids'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'

const submitBidSchema = z.object({
  amount: z.number().min(0, 'Amount must be positive'),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters'),
})

type SubmitBidForm = z.infer<typeof submitBidSchema>

export default function SubmitBidPage() {
  const { id: jobId } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<SubmitBidForm>({
    resolver: zodResolver(submitBidSchema),
  })

  const onSubmit = async (data: SubmitBidForm) => {
    if (!jobId) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await createBid({ jobId, amount: data.amount, coverLetter: data.coverLetter })
      setSuccess('Bid submitted successfully')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-green-100 to-blue-100">
      <div className="container max-w-3xl px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-white shadow-2xl">
            <CardHeader className="text-white bg-green-600">
              <CardTitle className="text-3xl">Submit Your Bid</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                <div>
                  <Label htmlFor="amount">Bid Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="Enter your bid amount" 
                    {...register('amount', { valueAsNumber: true })} 
                  />
                  {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea 
                    id="coverLetter" 
                    placeholder="Explain why you're the best fit for this job" 
                    className="min-h-[200px]" 
                    {...register('coverLetter')} 
                  />
                  {errors.coverLetter && <p className="mt-1 text-sm text-red-600">{errors.coverLetter.message}</p>}
                </div>
                
                <div>
                  <Label>Attach Files (optional)</Label>
                  <div className="p-6 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">Click or drag files here (e.g., portfolio, resume)</p>
                    <input type="file" multiple className="hidden" />
                  </div>
                </div>
                
                {error && <div className="p-3 text-red-600 rounded bg-red-50">{error}</div>}
                {success && <div className="p-3 text-green-600 rounded bg-green-50">{success}</div>}
                
                <Button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {loading ? 'Submitting...' : 'Submit Bid'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}