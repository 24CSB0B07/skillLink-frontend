import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { listJobs, type JobSummary } from '@/api/jobs'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BrowseJobsPage() {
  const [jobs, setJobs] = useState<JobSummary[] | null>(null)
  const [filteredJobs, setFilteredJobs] = useState<JobSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setLoading(true)
    listJobs()
      .then((data) => {
        const jobsArray = Array.isArray(data) ? data : [];
        setJobs(jobsArray)
        setFilteredJobs(jobsArray)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!jobs) return;
    if (searchTerm) {
      const filtered = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs])

  if (loading) return <div className="py-12 text-center">Loading jobs...</div>
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>
  if (!Array.isArray(filteredJobs) || filteredJobs.length === 0) return <div className="py-12 text-center">No jobs found.</div>

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container px-4 mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-4xl font-bold text-center"
        >
          Browse Available Jobs
        </motion.h1>
        
        <div className="flex flex-col gap-4 mb-8 md:flex-row">
          <div className="relative flex-1">
            <Input 
              placeholder="Search jobs by title or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={20} />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter size={20} /> Filters
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="flex flex-col h-full transition-shadow bg-white hover:shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="font-semibold text-green-600">
                    {job.budget ? `$${job.budget.toFixed(2)}` : 'Budget TBD'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="mb-4 line-clamp-3">{job.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {/* Assuming skills added to JobSummary in future */}
                    <Badge variant="secondary">Skill 1</Badge>
                    <Badge variant="secondary">Skill 2</Badge>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Link to={`/jobs/${job.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}