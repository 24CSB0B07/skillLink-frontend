import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function App() {
  return (
    <div className="container py-12 mx-auto">
      <Card className={cn(
        'bg-gradient-to-r from-indigo-50 to-sky-50 hover:from-indigo-100 hover:to-sky-100',
        'transition-all duration-300'
      )}>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-indigo-800">Welcome to SkillLink</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-lg text-gray-600">
            Connect with top talent or find your next project. Start exploring now!
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/jobs">
              <Button className="text-white transition-colors bg-indigo-500 hover:bg-indigo-600">
                Browse Jobs
              </Button>
            </Link>
            <Link to="/post-job">
              <Button variant="outline" className="text-indigo-500 transition-colors border-indigo-500 hover:bg-indigo-50">
                Post a Job
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}