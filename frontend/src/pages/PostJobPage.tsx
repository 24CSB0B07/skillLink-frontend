// src/pages/PostJobPage.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createJob } from '@/api/jobs.mutations'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

const postJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budget: z.number().min(0).optional(),
  type: z.enum(['fixed', 'hourly']),
  skills: z.array(z.string()).optional(),
})

type PostJobForm = z.infer<typeof postJobSchema>

export default function PostJobPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newSkill, setNewSkill] = useState('')
  const [skills, setSkills] = useState<string[]>([])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PostJobForm>({
    resolver: zodResolver(postJobSchema),
  })

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const onSubmit = async (data: PostJobForm) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = { ...data, skills }
      await createJob(payload)
      setSuccess('Job posted successfully')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-blue-100 to-green-100">
      <div className="container max-w-3xl px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="bg-white shadow-2xl">
            <CardHeader className="text-white bg-blue-600">
              <CardTitle className="text-3xl">Post a New Job</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" placeholder="Enter job title" {...register('title')} />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the job in detail" className="min-h-[200px]" {...register('description')} />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="budget">Budget (optional)</Label>
                    <Input id="budget" type="number" placeholder="Enter budget" {...register('budget', { valueAsNumber: true })} />
                    {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="type">Job Type</Label>
                    <Select onValueChange={(value) => setValue('type', value as 'fixed' | 'hourly')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
                  </div>
                </div>
                
                <div>
                  <Label>Skills Required</Label>
                  <div className="flex gap-2 mb-2">
                    <Input 
                      placeholder="Add skill" 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} className="bg-green-600">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                        {skill}
                        <X size={14} className="ml-2 cursor-pointer" onClick={() => removeSkill(skill)} />
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {error && <div className="p-3 text-red-600 rounded bg-red-50">{error}</div>}
                {success && <div className="p-3 text-green-600 rounded bg-green-50">{success}</div>}
                
                <Button disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                  {loading ? 'Posting...' : 'Post Job'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}