import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getThread, sendMessage } from '@/api/messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate } from '@/lib/utils';
import useWebSocket from 'react-use-websocket';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: { name: string; avatar?: string };
  timestamp: string;
}

interface Thread {
  id: string;
  title?: string;
  messages: Message[];
}

const MessageBubble = React.memo(({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) => (
  <motion.div
    initial={{ opacity: 0, x: isCurrentUser ? 20 : -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className={cn(
      'flex items-start gap-3 mb-4',
      isCurrentUser ? 'flex-row-reverse' : 'flex-row'
    )}
  >
    <Avatar className="w-8 h-8">
      <AvatarImage src={message.sender?.avatar} />
      <AvatarFallback>
        {message.sender?.name?.charAt(0) || message.senderId.charAt(0)}
      </AvatarFallback>
    </Avatar>
    <div
      className={cn(
        'glass p-3 rounded-lg max-w-[70%]',
        isCurrentUser ? 'bg-indigo-500/20 border-indigo-300' : 'bg-white/20 border-indigo-200'
      )}
    >
      <p className={cn('text-sm', isCurrentUser ? 'text-indigo-100' : 'text-indigo-800')}>
        {message.content}
      </p>
      <p className={cn('text-xs mt-1', isCurrentUser ? 'text-indigo-200' : 'text-indigo-600')}>
        {formatDate(message.timestamp)}
      </p>
    </div>
  </motion.div>
));

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');

  const { lastMessage } = useWebSocket(`ws://api.skilllink.com/messages/threads/${id}`, {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setThread((prev) => prev ? { ...prev, messages: [...prev.messages, data.message] } : prev);
      }
    },
  });

  const fetchThread = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getThread(id);
      setThread(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const onSend = useCallback(async () => {
    if (!id || !content.trim()) return;
    try {
      await sendMessage(id, content);
      setContent('');
      await fetchThread();
    } catch (e: any) {
      alert(e.message);
    }
  }, [id, content, fetchThread]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  return (
    <div className="min-h-screen px-4 py-12 animated-bg">
      <div className="container max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-3xl font-bold text-center text-indigo-800"
        >
          {thread?.title || 'Conversation'}
        </motion.h1>
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
          ) : !thread ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-indigo-800"
            >
              Not found
            </motion.div>
          ) : (
            <div className="grid gap-4">
              <div className="flex-1 overflow-y-auto max-h-[70vh] p-4 glass rounded-2xl">
                {(thread.messages || []).map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={message.senderId === user?.id}
                  />
                ))}
              </div>
              <div className="sticky bottom-0 p-4 glass rounded-2xl">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="border-indigo-200 bg-white/50 focus:ring-indigo-500"
                    onKeyPress={(e) => e.key === 'Enter' && onSend()}
                  />
                  <Button
                    onClick={onSend}
                    className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}