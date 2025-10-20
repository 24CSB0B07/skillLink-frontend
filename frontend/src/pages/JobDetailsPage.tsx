// src/pages/JobDetailsPage.tsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getJob, type JobDetail } from '@/api/jobs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getJob(id)
      .then(setJob)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="py-12 text-center">Loading...</div>
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>
  if (!job) return <div className="py-12 text-center">Not found</div>

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container max-w-4xl px-4 mx-auto">
        <Link to="/jobs" className="inline-flex items-center mb-6 text-blue-600 hover:underline">
          <ArrowLeft size={20} className="mr-2" /> Back to Jobs
        </Link>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-white bg-green-600">
              <CardTitle className="text-3xl">{job.title}</CardTitle>
              <CardDescription className="text-lg text-green-100">
                {job.budget ? `Budget: $${job.budget.toFixed(2)}` : 'Budget TBD'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold">Description</h3>
              <p className="mb-6 whitespace-pre-wrap">{job.description}</p>
              
              {job.skills && job.skills.length > 0 && (
                <>
                  <h3 className="mb-4 text-xl font-semibold">Required Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.skills.map((s) => (
                      <Badge key={s} variant="outline" className="text-blue-600 border-blue-600">{s}</Badge>
                    ))}
                  </div>
                </>
              )}
              
              <h3 className="mb-4 text-xl font-semibold">Client Information</h3>
              <p className="mb-6">Client ID: {job.clientId}</p> {/* Add more client details if available */}
              
              <Link to={`/jobs/${job.id}/bid`}>
                <Button className="w-full bg-blue-600 md:w-auto hover:bg-blue-700">Submit Your Bid</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}