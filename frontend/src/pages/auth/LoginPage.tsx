import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 animated-bg">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn('glass max-w-md w-full p-8 rounded-2xl')}
      >
        <h1 className="mb-6 text-3xl font-bold text-center text-indigo-800">Login to SkillLink</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="email" className="text-indigo-800">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className="border-indigo-200 bg-white/50 focus:ring-indigo-500"
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Label htmlFor="password" className="text-indigo-800">Password</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password')}
              className="border-indigo-200 bg-white/50 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute text-indigo-500 right-3 top-9"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-indigo-800">
              <input type="checkbox" className="mr-2 accent-indigo-500" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-center text-red-500"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            disabled={loading}
            className={cn(
              'w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600',
              loading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-indigo-800">Or login with</p>
          <div className="flex justify-center gap-4 mt-3">
            <Button
              variant="outline"
              className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="text-white bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              Apple
            </Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-center text-indigo-800">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}