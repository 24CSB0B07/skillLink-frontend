import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Search, Briefcase, Star, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import React from "react";
import ClientDashboard from '@/pages/dashboards/ClientDashboard';
import FreelancerDashboard from '@/pages/dashboards/FreelancerDashboard';

// Placeholder APIs; replace with actual APIs from jobs.ts or analytics.ts
const searchJobs = async (query: string) => ({
  results: [
    { id: '1', title: `Web Developer - ${query}`, budget: 1500 },
    { id: '2', title: `Designer - ${query}`, budget: 500 },
  ],
});

const getFeaturedJobs = async () => [
  { id: '1', title: 'Web Developer Needed', budget: 1500, client: 'Tech Corp' },
  { id: '2', title: 'Graphic Designer for Logo', budget: 500, client: 'Creative Studio' },
  { id: '3', title: 'AI Consultant', budget: 3000, client: 'Data Innovate' },
];

const getPlatformStats = async () => ({
  freelancers: 50000,
  jobsCompleted: 100000,
  totalEarnings: 5000000,
});

const getTestimonials = async () => [
  { id: '1', name: 'Jane Doe', role: 'Client', comment: 'SkillLink made hiring top talent effortless!', rating: 5 },
  { id: '2', name: 'John Smith', role: 'Freelancer', comment: 'Found amazing projects quickly.', rating: 4.5 },
  { id: '3', name: 'Alex Brown', role: 'Client', comment: 'Secure payments and great support.', rating: 5 },
];

interface Job { id: string; title: string; budget: number; client: string; }
interface Stat { freelancers: number; jobsCompleted: number; totalEarnings: number; }
interface Testimonial { id: string; name: string; role: string; comment: string; rating: number; }

const CategoryCard = React.memo(({ category, index }: { category: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
  >
    <Link to={`/jobs?category=${encodeURIComponent(category)}`}>
      <Card className={cn(
        'bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]',
        'border border-indigo-200'
      )}>
        <CardHeader>
          <CardTitle className="text-lg text-indigo-800">{category}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  </motion.div>
));

const JobCard = React.memo(({ job }: { job: Job }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className={cn(
      'bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]',
      'border border-indigo-200'
    )}>
      <CardHeader>
        <CardTitle className="text-lg text-indigo-800">{job.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Client: {job.client}</p>
        <p className="text-sm text-gray-600">Budget: ${job.budget}</p>
        <Link to={`/jobs/${job.id}`}>
          <Button variant="gradient" size="sm" className="mt-4">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  </motion.div>
));

const TestimonialCard = React.memo(({ testimonial }: { testimonial: Testimonial }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-white border-indigo-200">
      <CardContent className="pt-6">
        <div className="flex items-center mb-2">
          {Array.from({ length: Math.floor(testimonial.rating) }).map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
          ))}
        </div>
        <p className="mb-2 text-sm text-gray-600">"{testimonial.comment}"</p>
        <p className="text-sm font-semibold text-indigo-800">{testimonial.name} - {testimonial.role}</p>
      </CardContent>
    </Card>
  </motion.div>
));

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stat | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  if (user?.role === 'client') return <ClientDashboard />;
  if (user?.role === 'freelancer') return <FreelancerDashboard />;

  const categories = [
    'Development & IT', 'Design & Creative', 'AI Services', 'Sales & Marketing',
    'Writing & Translation', 'Admin & Support', 'Finance & Accounting', 'Legal',
    'HR & Training', 'Engineering & Architecture'
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsData, statsData, testimonialsData] = await Promise.all([
        getFeaturedJobs(),
        getPlatformStats(),
        getTestimonials(),
      ]);
      setJobs(jobsData);
      setStats(statsData);
      setTestimonials(testimonialsData);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query) navigate(`/jobs?search=${encodeURIComponent(query)}`);
    }, 500),
    [navigate]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative py-20 text-center bg-gradient-to-r from-indigo-600 to-sky-600"
      >
        <div className="container px-4 mx-auto">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6 text-5xl font-bold text-white"
          >
            Discover Top Talent with SkillLink
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-2xl mx-auto mb-8 text-xl text-white/80"
          >
            Hire skilled freelancers or find your next project in minutes.
          </motion.p>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative w-full max-w-xl mx-auto"
          >
            <Input
              placeholder="Search for skills or jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-6 pl-4 pr-12 text-black rounded-full bg-white/90"
            />
            <Search className="absolute text-gray-500 transform -translate-y-1/2 right-4 top-1/2" />
          </motion.div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex justify-center gap-4 mt-8"
          >
            <Link to="/jobs">
              <Button className="px-8 py-6 text-lg text-indigo-600 bg-white hover:bg-gray-100">
                Find Work
              </Button>
            </Link>
            <Link to="/post-job">
              <Button className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600">
                Hire Talent
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Categories Section */}
      <section className="container px-4 py-12 mx-auto">
        <h2 className="mb-8 text-3xl font-semibold text-center text-indigo-800">Explore Categories</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, i) => (
            <CategoryCard key={cat} category={cat} index={i} />
          ))}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 mx-auto">
          <h2 className="mb-8 text-3xl font-semibold text-center text-indigo-800">Featured Jobs</h2>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link to="/jobs">
              <Button variant="gradient">See All Jobs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-50 to-sky-50">
        <div className="container px-4 mx-auto">
          <h2 className="mb-8 text-3xl font-semibold text-center text-indigo-800">What Our Users Say</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 text-white bg-gradient-to-r from-indigo-600 to-sky-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-8 text-3xl font-semibold">SkillLink by the Numbers</h2>
          {stats && (
            <div className="grid gap-6 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-none bg-white/10">
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-white">{stats.freelancers.toLocaleString()}</p>
                    <p className="text-sm text-white/80">Freelancers</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="border-none bg-white/10">
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-white">{stats.jobsCompleted.toLocaleString()}</p>
                    <p className="text-sm text-white/80">Jobs Completed</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Card className="border-none bg-white/10">
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-white">${stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-sm text-white/80">Total Earnings</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center">
        <div className="container px-4 mx-auto">
          <h2 className="mb-6 text-3xl font-semibold text-indigo-800">Ready to Get Started?</h2>
          <div className="flex justify-center gap-4">
            <Link to="/jobs">
              <Button className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600">
                Browse Jobs
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="px-8 py-6 text-lg text-indigo-500 border-indigo-500 hover:bg-indigo-50">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}