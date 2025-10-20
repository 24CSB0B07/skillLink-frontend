import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate } from '@/lib/utils';
import { listThreads } from '@/api/messages';
import useWebSocket from 'react-use-websocket';
import React from 'react';

interface Thread {
  id: string;
  title?: string;
  lastMessage?: { content: string; senderId: string; sender?: { name: string; avatar?: string }; timestamp: string };
}

const ThreadCard = React.memo(({ thread }: { thread: Thread }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Link to={`/messages/${thread.id}`}>
      <Card className={cn(
        'glass hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]',
        'border-indigo-200'
      )}>
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={thread.lastMessage?.sender?.avatar} />
            <AvatarFallback>
              {thread.lastMessage?.sender?.name?.charAt(0) || thread.lastMessage?.senderId?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-indigo-800">
              {thread.title || thread.lastMessage?.sender?.name || thread.lastMessage?.senderId || 'Thread'}
            </div>
            <div className="text-sm text-muted-foreground">
              {thread.lastMessage?.content?.substring(0, 50) || 'No messages yet'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-indigo-600">
            {thread.lastMessage?.timestamp ? formatDate(thread.lastMessage.timestamp) : 'No date'}
          </p>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
));

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { lastMessage } = useWebSocket('ws://api.skilllink.com/notifications', {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setThreads((prev) => {
          if (!prev) return prev;
          const updated = [...prev];
          const index = updated.findIndex((t) => t.id === data.threadId);
          if (index !== -1) {
            updated[index] = { ...updated[index], lastMessage: data.message };
            return updated.sort((a, b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime());
          }
          return [data.thread, ...prev];
        });
      }
    },
  });

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listThreads();
      setThreads(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return (
    <div className="min-h-screen px-4 py-12 animated-bg">
      <div className="container max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-3xl font-bold text-center text-indigo-800"
        >
          Messages
        </motion.h1>
        <div className="mb-6 text-center">
          <Link to="/messages/new">
            <Button className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600">
              Start New Chat
            </Button>
          </Link>
        </div>
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
          ) : !threads || threads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-indigo-800"
            >
              No messages.
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {threads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}