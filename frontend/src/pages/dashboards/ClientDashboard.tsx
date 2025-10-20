import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BarChart, Wallet, Briefcase, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatCurrency } from '@/lib/utils';
import useWebSocket from 'react-use-websocket';
import React from "react";

// Placeholder API; replace with actual API when provided
const getClientAnalytics = async () => ({
  activeContracts: 5,
  totalSpend: 2500,
  pendingProposals: 3,
  messages: 12,
  recentActivity: [
    { id: '1', description: 'New proposal received', timestamp: '2 hours ago' },
    { id: '2', description: 'Contract started', timestamp: 'Yesterday' },
    { id: '3', description: 'Payment released', timestamp: '3 days ago' },
  ],
});

interface Analytics {
  activeContracts: number;
  totalSpend: number;
  pendingProposals: number;
  messages: number;
  recentActivity: { id: string; description: string; timestamp: string }[];
}

const StatCard = React.memo(({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <Card className={cn(
      'bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]',
      'border border-indigo-200'
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-indigo-800">{title}</CardTitle>
        <Icon className="w-4 h-4 text-indigo-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-indigo-800">{value}</div>
        <div className={cn('h-1 w-full rounded mt-2', color)} />
      </CardContent>
    </Card>
  </motion.div>
));

const ActivityItem = React.memo(({ activity }: { activity: { id: string; description: string; timestamp: string } }) => (
  <li className="flex justify-between text-sm text-gray-600">
    <span>{activity.description}</span>
    <span className="text-muted-foreground">{activity.timestamp}</span>
  </li>
));

export default function ClientDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { lastMessage } = useWebSocket('ws://api.skilllink.com/client/updates', {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      setAnalytics((prev) => {
        if (!prev) return prev;
        if (data.type === 'analytics') return { ...prev, ...data.payload };
        if (data.type === 'activity') return { ...prev, recentActivity: [data.payload, ...prev.recentActivity.slice(0, 4)] };
        return prev;
      });
    },
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClientAnalytics();
      setAnalytics(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'client') return;
    fetchAnalytics();
  }, [fetchAnalytics, user]);

  if (!user || user.role !== 'client') return <div className="text-center text-gray-600">Please login as a client</div>;
  if (loading) return <div className="text-center text-gray-600">Loading...</div>;
  if (error) return <div className="text-center text-red-600">{error}</div>;

  const stats = [
    { title: 'Active Contracts', value: analytics?.activeContracts ?? 0, icon: Briefcase, color: 'bg-indigo-500' },
    { title: 'Total Spend', value: formatCurrency(analytics?.totalSpend ?? 0), icon: Wallet, color: 'bg-green-500' },
    { title: 'Pending Proposals', value: analytics?.pendingProposals ?? 0, icon: BarChart, color: 'bg-purple-500' },
    { title: 'Unread Messages', value: analytics?.messages ?? 0, icon: MessageSquare, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-indigo-50 to-sky-50">
      <div className="container max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-4xl font-bold text-center text-indigo-800"
        >
          Client Dashboard
        </motion.h1>

        <div className="grid gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
          ))}
        </div>

        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold text-center text-indigo-800">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/post-job">
              <Button className="w-full h-24 text-lg transition-all bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600">
                Post a Job
              </Button>
            </Link>
            <Link to="/contracts">
              <Button className="w-full h-24 text-lg transition-all bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600">
                View Contracts
              </Button>
            </Link>
            <Link to="/messages">
              <Button className="w-full h-24 text-lg transition-all bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600">
                Messages
              </Button>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold text-center text-indigo-800">Recent Activity</h2>
          <Card className="bg-white border-indigo-200">
            <CardContent className="p-6">
              {analytics?.recentActivity.length ? (
                <ul className="space-y-4">
                  {analytics.recentActivity.slice(0, 5).map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No recent activity.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}